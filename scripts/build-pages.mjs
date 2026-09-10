import {
  mkdirSync,
  renameSync,
  existsSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "fs";
import { spawnSync } from "child_process";
import path from "path";

const root = process.cwd();
const apiDir = path.join(root, "app", "api");
const backupDir = path.join(root, ".api-backup-pages");

function restoreApi() {
  if (existsSync(backupDir)) {
    if (existsSync(apiDir)) {
      rmSync(apiDir, { recursive: true, force: true });
    }
    renameSync(backupDir, apiDir);
  }
}

process.on("exit", restoreApi);
process.on("SIGINT", () => {
  restoreApi();
  process.exit(1);
});
process.on("SIGTERM", () => {
  restoreApi();
  process.exit(1);
});

if (existsSync(backupDir)) {
  rmSync(backupDir, { recursive: true, force: true });
}

if (existsSync(apiDir)) {
  renameSync(apiDir, backupDir);
}

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    GITHUB_PAGES: "true",
    PAGES_REPO_NAME: process.env.PAGES_REPO_NAME || "Gear-Tracker",
  },
  shell: process.platform === "win32",
});

restoreApi();

const outDir = path.join(root, "out");
if (existsSync(outDir)) {
  writeFileSync(path.join(outDir, ".nojekyll"), "");
  const notFound = path.join(outDir, "404.html");
  const library = path.join(outDir, "library", "index.html");
  if (existsSync(library)) {
    writeFileSync(notFound, readFileSync(library, "utf8"));
  }
}

process.exit(result.status ?? 1);
