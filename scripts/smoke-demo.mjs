import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const port = Number.parseInt(process.env.SMOKE_PORT || "3210", 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("SMOKE_PORT must be a valid TCP port");
}
if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required for the production demo smoke test");
}

const baseUrl = `http://127.0.0.1:${port}`;
let serverOutput = "";

const server = spawn(process.execPath, ["server.js"], {
  env: {
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
    NEXT_PUBLIC_APP_URL: baseUrl,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

function capture(chunk) {
  serverOutput += chunk.toString();
  if (serverOutput.length > 20_000) serverOutput = serverOutput.slice(-20_000);
}

server.stdout?.on("data", capture);
server.stderr?.on("data", capture);

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "text/html,application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  const text = await response.text();
  assert.equal(
    response.status,
    200,
    `${path} returned ${response.status}\n${text.slice(0, 1_000)}`,
  );
  return { response, text };
}

async function fetchJson(path) {
  const { text } = await fetchText(path);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path} did not return valid JSON: ${text.slice(0, 1_000)}`);
  }
}

async function waitForHealth() {
  const deadline = Date.now() + 30_000;
  let lastError = null;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`StockPulse exited before becoming healthy (code ${server.exitCode})`);
    }
    try {
      const health = await fetchJson("/api/health");
      if (health?.status === "ok") return;
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }

  throw new Error(
    `StockPulse did not become healthy within 30 seconds${lastError ? `: ${lastError.message}` : ""}`,
  );
}

async function shutdown() {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([once(server, "exit"), delay(5_000)]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

try {
  await waitForHealth();

  const health = await fetchJson("/api/health");
  assert.equal(health.status, "ok");
  assert.equal(health.service, "stockpulse-web");

  const readiness = await fetchJson("/api/ready");
  assert.equal(readiness.status, "ready");
  assert.equal(readiness.mode, "demo");
  assert.equal(readiness.checks?.database?.reachable, true);
  assert.equal(readiness.checks?.marketData?.syntheticDemoData, true);
  assert.deepEqual(readiness.checks?.marketData?.providers, ["demo"]);

  const quotes = await fetchJson("/api/quotes?symbols=DEMO,AAPL");
  assert.equal(Array.isArray(quotes.data), true);
  assert.deepEqual(
    quotes.data.map((quote) => quote.symbol),
    ["DEMO", "AAPL"],
  );
  assert.equal(quotes.data.every((quote) => Number.isFinite(quote.price) && quote.price > 0), true);

  const home = await fetchText("/");
  assert.match(home.text, /Demo mode: prices, charts, search results, profiles, and news are deterministic synthetic fixtures\./);

  const stock = await fetchText("/stocks/DEMO");
  assert.match(stock.text, /StockPulse Demo Corp\./);

  const changes = await fetchText("/stocks/DEMO/changes");
  assert.match(changes.text, /DEMO/);

  const grounding = await fetchText("/stocks/DEMO/grounding");
  assert.match(grounding.text, /DEMO/);

  const news = await fetchText("/news");
  assert.match(news.text, /synthetic/i);

  console.log("[demo-smoke] Production demo smoke passed.");
  console.log("[demo-smoke] Verified health, readiness, synthetic quotes, disclosure, stock, changes, grounding, and news routes.");
} catch (error) {
  console.error("[demo-smoke] Failed:", error instanceof Error ? error.message : error);
  if (serverOutput.trim()) {
    console.error("[demo-smoke] Server output:\n" + serverOutput.trim());
  }
  process.exitCode = 1;
} finally {
  await shutdown();
}
