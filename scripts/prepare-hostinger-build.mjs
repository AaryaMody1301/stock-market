import fs from "node:fs/promises";
import path from "node:path";

const isPosix = process.platform !== "win32";

// Hostinger ZIP extraction can occasionally produce directories/files
// that are not readable by the build worker. Normalize permissions on POSIX.
async function setPermissions(targetPath) {
  const stat = await fs.stat(targetPath);

  if (stat.isDirectory()) {
    await fs.chmod(targetPath, 0o755);
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      await setPermissions(path.join(targetPath, entry.name));
    }
    return;
  }

  if (stat.isFile()) {
    await fs.chmod(targetPath, 0o644);
  }
}

async function main() {
  if (!isPosix) {
    console.log("[prebuild] Skipping permission normalization on Windows.");
    return;
  }

  const roots = ["src", "prisma", "scripts", "public"];

  for (const root of roots) {
    try {
      await fs.access(root);
      await setPermissions(root);
      console.log(`[prebuild] Permissions normalized for ${root}`);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
        continue;
      }
      throw err;
    }
  }
}

main().catch((err) => {
  console.error("[prebuild] Failed to normalize permissions:", err);
  process.exit(1);
});
