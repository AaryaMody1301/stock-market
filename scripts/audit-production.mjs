import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const severityRank = {
  info: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

function fail(message) {
  console.error(`[production-audit] ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Unable to read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const lock = readJson("package-lock.json");
const lockPackages = lock.packages ?? {};
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["audit", "--omit=dev", "--json"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

if (result.error) {
  fail(`Unable to run npm audit: ${result.error.message}`);
}

let report;
try {
  report = JSON.parse(result.stdout || "{}");
} catch (error) {
  if (result.stderr) process.stderr.write(result.stderr);
  fail(`npm audit did not return valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

function lockEntryIsDevOnly(path) {
  const entry = lockPackages[path];
  return Boolean(entry && (entry.dev === true || entry.devOptional === true));
}

const ignored = [];
const blockers = [];

for (const [name, vulnerability] of Object.entries(report.vulnerabilities ?? {})) {
  const severity = vulnerability?.severity ?? "info";
  if ((severityRank[severity] ?? 0) < severityRank.high) continue;

  const nodes = Array.isArray(vulnerability?.nodes) && vulnerability.nodes.length > 0
    ? vulnerability.nodes
    : [`node_modules/${name}`];

  const devOnly = nodes.every(lockEntryIsDevOnly);
  const item = {
    name,
    severity,
    nodes,
  };

  if (devOnly) ignored.push(item);
  else blockers.push(item);
}

if (ignored.length > 0) {
  console.log("[production-audit] Ignoring high/critical advisories confined to dev/devOptional lockfile entries:");
  for (const item of ignored) {
    console.log(`  - ${item.name} (${item.severity}): ${item.nodes.join(", ")}`);
  }
}

if (blockers.length > 0) {
  console.error("[production-audit] High/critical vulnerabilities are reachable from non-dev runtime packages:");
  for (const item of blockers) {
    console.error(`  - ${item.name} (${item.severity}): ${item.nodes.join(", ")}`);
  }
  process.exit(1);
}

console.log("[production-audit] No high/critical vulnerabilities are reachable from required runtime packages.");
