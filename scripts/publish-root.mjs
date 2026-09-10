import { cpSync, existsSync, rmSync, mkdirSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const root = process.cwd();
const outDir = join(root, "out");

const build = spawnSync("npm", ["run", "build:pages"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (!existsSync(outDir)) {
  console.error("out/ missing after build");
  process.exit(1);
}

const publishDirs = ["_next", "library", "lists", "compare", "settings", "404"];
for (const dir of publishDirs) {
  rmSync(join(root, dir), { recursive: true, force: true });
}

const publishFiles = [".nojekyll", "index.html", "404.html", "favicon.svg"];
for (const file of publishFiles) {
  rmSync(join(root, file), { force: true });
}

for (const name of [...publishDirs, ...publishFiles]) {
  const from = join(outDir, name);
  if (existsSync(from)) {
    cpSync(from, join(root, name), { recursive: true });
  }
}

console.log("Published static site to repo root for GitHub Pages (legacy branch deploy).");
