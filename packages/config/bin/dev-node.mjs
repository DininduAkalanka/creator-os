#!/usr/bin/env node
/**
 * `pnpm dev` for the Node apps (api, worker): compile once, then recompile on every change and
 * restart the app. Uses only tsc --watch and node --watch, so no extra dependency. Reads an
 * optional .env.local in the app's folder (git-ignored), through Node's --env-file-if-exists.
 * Run it from the app's folder; it builds with that app's tsconfig.build.json into dist/.
 */
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

const tsc = createRequire(join(process.cwd(), "package.json")).resolve("typescript/bin/tsc");
const project = ["-p", "tsconfig.build.json"];

const first = spawnSync(process.execPath, [tsc, ...project], { stdio: "inherit" });
if (first.status !== 0) process.exit(first.status ?? 1);

const children = [
  spawn(process.execPath, [tsc, ...project, "--watch", "--preserveWatchOutput"], {
    stdio: "inherit",
  }),
  spawn(
    process.execPath,
    ["--watch", "--env-file-if-exists=.env.local", "--enable-source-maps", "dist/main.js"],
    { stdio: "inherit" },
  ),
];

function stopAll() {
  for (const child of children) child.kill("SIGTERM");
}
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);
for (const child of children) {
  child.on("exit", (code) => {
    if (code !== null && code !== 0) {
      process.exitCode = code;
      stopAll();
    }
  });
}
