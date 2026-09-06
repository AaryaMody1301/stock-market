import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, realpathSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const port = Number(process.env.BROWSER_SMOKE_PORT || 3211);
const baseUrl = `http://127.0.0.1:${port}`;
const serverLogs = [];
let server;
let browser;

function appendLog(chunk) {
  const text = chunk.toString();
  serverLogs.push(text);
  if (serverLogs.length > 80) serverLogs.shift();
}

function resolvePlaywright() {
  const executableName = process.platform === "win32" ? "playwright.cmd" : "playwright";
  const pathEntries = (process.env.PATH || "").split(path.delimiter).filter(Boolean);

  for (const entry of pathEntries) {
    const candidate = path.join(entry, executableName);
    if (!existsSync(candidate)) continue;

    const cliPath = realpathSync(candidate);
    const packageRoot = path.dirname(cliPath);
    const packageEntry = path.join(packageRoot, "index.js");
    if (!existsSync(packageEntry)) continue;

    const require = createRequire(import.meta.url);
    return require(packageEntry);
  }

  throw new Error(
    "Playwright was not found on PATH. Run this script through the pinned npm exec command in package.json.",
  );
}

async function waitForHttp(pathname, { timeoutMs = 30_000, expectedStatus = 200 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}${pathname}`, { redirect: "manual" });
      if (response.status === expectedStatus) return response;
      lastError = new Error(`${pathname} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw lastError || new Error(`Timed out waiting for ${pathname}`);
}

async function waitForVisible(locator, label) {
  try {
    await locator.first().waitFor({ state: "visible", timeout: 12_000 });
  } catch (error) {
    throw new Error(`Browser acceptance could not find visible ${label}: ${error instanceof Error ? error.message : error}`);
  }
}

async function expectInputValue(locator, expected, label) {
  await waitForVisible(locator, label);
  const actual = await locator.inputValue();
  assert.equal(actual, expected, `${label} should equal the persisted value`);
}

function startServer() {
  assert.ok(existsSync(path.resolve(".next")), "Production build directory .next is missing; run npm run build first");

  const env = {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    STOCKPULSE_DEMO_MODE: "true",
    FINNHUB_API_KEY: "",
    TWELVEDATA_API_KEY: "",
    SEC_USER_AGENT: "",
    AI_GATEWAY_API_KEY: "",
    AI_API_KEY: "",
    AI_MODEL: "",
  };

  server = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", appendLog);
  server.stderr?.on("data", appendLog);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

async function runBrowserWorkflow() {
  const { chromium } = resolvePlaywright();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const field = (name) => page.getByLabel(name, { exact: true });

  const initialSummary =
    "Browser acceptance thesis: durable evidence should remain reviewable and falsifiable across sessions.";
  const updatedSummary =
    "Browser acceptance thesis updated: the reviewer can revise reasoning without losing the earlier snapshot.";

  await page.goto(`${baseUrl}/research`, { waitUntil: "domcontentloaded" });
  await waitForVisible(page.getByRole("heading", { name: "Investment theses" }), "research workspace heading");
  await waitForVisible(page.getByText("Demo mode:", { exact: false }), "synthetic-data disclosure");

  await page.getByRole("button", { name: "New thesis", exact: true }).click();
  await field("Ticker").fill("DEMO");
  await field("Title").fill("Browser acceptance research thesis");
  await field("Core thesis").fill(initialSummary);
  await field("Assumptions").fill("Revenue remains measurable\nEvidence stays attributable");
  await field("Catalysts").fill("New comparable filing evidence");
  await field("Risks").fill("Evidence quality deteriorates");
  await field("Invalidation criteria").fill("Primary-source evidence contradicts the core thesis");
  await field("Save note").fill("Browser acceptance initial thesis");
  await page.getByRole("button", { name: "Save thesis", exact: true }).click();
  await waitForVisible(
    page.getByText("Saved DEMO. Revision history is preserved locally.", { exact: true }),
    "initial save confirmation",
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForVisible(page.getByText("Research loaded from this browser.", { exact: true }), "IndexedDB reload status");
  await expectInputValue(field("Ticker"), "DEMO", "persisted ticker");
  await expectInputValue(field("Core thesis"), initialSummary, "persisted core thesis");

  await field("Core thesis").fill(updatedSummary);
  await field("Save note").fill("Browser acceptance second revision");
  await page.getByRole("button", { name: "Save thesis", exact: true }).click();
  await waitForVisible(
    page.getByText("Saved DEMO. Revision history is preserved locally.", { exact: true }),
    "revision save confirmation",
  );
  await waitForVisible(page.getByText("1 revisions", { exact: true }), "revision counter");
  await waitForVisible(page.getByText("Browser acceptance second revision", { exact: true }), "revision note");

  await page.getByRole("button", { name: "Restore to editor", exact: true }).first().click();
  await waitForVisible(
    page.getByText("Revision restored to the editor. Review it and save to create a new revision.", { exact: true }),
    "revision restore confirmation",
  );
  await expectInputValue(field("Core thesis"), initialSummary, "restored core thesis");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /^stockpulse-theses-\d{4}-\d{2}-\d{2}\.json$/);
  const downloadPath = await download.path();
  assert.ok(downloadPath, "Export download should have a local path in Chromium CI");
  const exported = JSON.parse(readFileSync(downloadPath, "utf8"));
  assert.equal(exported.format, "stockpulse-thesis-export");
  assert.equal(exported.version, 1);
  assert.equal(exported.records.length, 1);
  assert.equal(exported.records[0].symbol, "DEMO");
  assert.equal(exported.records[0].summary, updatedSummary);
  assert.equal(exported.records[0].revisions.length, 1);
  await waitForVisible(page.getByText("Exported 1 thesis record(s).", { exact: true }), "export confirmation");

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await waitForVisible(page.getByText("Deleted DEMO from this browser.", { exact: true }), "delete confirmation");
  await waitForVisible(page.getByText("Create your first thesis to begin a review history.", { exact: true }), "empty research state");

  const importInput = page.locator('input[type="file"][accept*="json"]');
  await importInput.setInputFiles(downloadPath);
  await waitForVisible(page.getByText("Imported 1 validated thesis record(s).", { exact: true }), "import confirmation");
  await waitForVisible(page.getByText("DEMO", { exact: true }).first(), "imported research record");

  await page.goto(`${baseUrl}/stocks/DEMO`, { waitUntil: "domcontentloaded" });
  const watchButton = page.getByRole("button", { name: "Watch", exact: true });
  await waitForVisible(watchButton, "Watch button");
  await watchButton.click();
  await waitForVisible(page.getByRole("button", { name: "Watching", exact: true }), "Watching state");

  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForVisible(page.getByRole("button", { name: "Watching", exact: true }), "persisted Watching state after reload");

  await page.goto(`${baseUrl}/watchlist`, { waitUntil: "domcontentloaded" });
  await waitForVisible(page.getByText("DEMO", { exact: true }).first(), "DEMO watchlist entry");

  await page.goto(`${baseUrl}/stocks/DEMO`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Watching", exact: true }).click();
  await waitForVisible(page.getByRole("button", { name: "Watch", exact: true }), "removed watchlist state");
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForVisible(page.getByRole("button", { name: "Watch", exact: true }), "persisted watchlist removal");

  await context.close();
}

try {
  startServer();
  await waitForHttp("/api/health");
  const ready = await waitForHttp("/api/ready");
  const readiness = await ready.json();
  assert.equal(readiness.mode, "demo");
  assert.deepEqual(readiness.checks.marketData.providers, ["demo"]);
  assert.equal(readiness.checks.database.reachable, true);

  await runBrowserWorkflow();
  console.log("[browser-demo] Browser reviewer workflow passed.");
  console.log(
    "[browser-demo] Verified IndexedDB persistence, revision restore, export/delete/import, demo disclosure, and watchlist localStorage persistence.",
  );
} catch (error) {
  console.error(`[browser-demo] ${error instanceof Error ? error.stack || error.message : error}`);
  if (serverLogs.length) {
    console.error("[browser-demo] Recent production server logs:\n" + serverLogs.join("").slice(-12_000));
  }
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => undefined);
  await stopServer();
}
