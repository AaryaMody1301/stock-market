import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function fail(message) {
  console.error(`[release-check] ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Unable to read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const root = process.cwd();
const packagePath = resolve(root, "package.json");
const lockPath = resolve(root, "package-lock.json");
const pkg = readJson(packagePath);
const lock = readJson(lockPath);
const version = pkg.version;

if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`package.json version must be a stable x.y.z version; received ${String(version)}`);
}

if (lock.version !== version || lock.packages?.[""]?.version !== version) {
  fail("package.json and package-lock.json root versions must match");
}

const releaseGuide = resolve(root, "docs", "RELEASE.md");
const releaseNotes = resolve(root, "docs", `RELEASE_NOTES_v${version}.md`);

for (const path of [releaseGuide, releaseNotes]) {
  if (!existsSync(path)) fail(`Missing required release document: ${path}`);
}

const notes = readFileSync(releaseNotes, "utf8");
if (!notes.includes(`# StockPulse v${version}`)) {
  fail(`Release notes must include the heading '# StockPulse v${version}'`);
}

const tag = process.env.STOCKPULSE_RELEASE_TAG?.trim();
if (tag) {
  const escapedVersion = version.replaceAll(".", "\\.");
  const allowed = new RegExp(`^v${escapedVersion}(?:-rc\\.[1-9]\\d*)?$`);
  if (!allowed.test(tag)) {
    fail(`Tag ${tag} must be v${version} or v${version}-rc.N`);
  }
}

console.log(`[release-check] StockPulse ${version} release metadata is consistent.`);
