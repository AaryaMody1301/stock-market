import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const env = {
  ...process.env,
  NODE_ENV: "production",
};

const port = process.env.PORT || "3000";
env.PORT = port;

// Prefer standalone server when available (Hostinger / Docker deployments)
const standaloneServer = path.resolve(".next", "standalone", "server.js");

let cmd, args;
if (fs.existsSync(standaloneServer)) {
  cmd = process.execPath;
  args = [standaloneServer];
} else {
  cmd = process.execPath;
  args = ["./node_modules/next/dist/bin/next", "start", "-p", port];
}

const child = spawn(cmd, args, {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
