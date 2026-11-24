#!/usr/bin/env node
/**
 * `pnpm dev` for the Node apps (api, worker): tsc --watch recompiles on every change and
 * node --watch restarts the app. The app starts once the watcher's first compile has finished,
 * so it starts exactly once. No extra dependency. Reads an optional .env.local in the app's
 * folder (git-ignored), through Node's --env-file-if-exists. Run it from the app's folder; it
 * builds with that app's tsconfig.build.json into dist/.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

const tsc = createRequire(join(process.cwd(), "package.json")).resolve("typescript/bin/tsc");
const compileDone = /Found \d+ errors?\. Watching for file changes\./;

const children = [];
const watcher = spawn(
  process.execPath,
  [tsc, "-p", "tsconfig.build.json", "--watch", "--preserveWatchOutput"],
  { stdio: ["ignore", "pipe", "inherit"] },
);
children.push(watcher);

let app;
watcher.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  if (app || !compileDone.test(String(chunk))) return;
  app = spawn(
    process.execPath,
    ["--watch", "--env-file-if-exists=.env.local", "--enable-source-maps", "dist/main.js"],
    { stdio: "inherit" },
  );
  children.push(app);
  stopOnFailure(app);
});

function stopAll() {
  for (const child of children) child.kill("SIGTERM");
}
function stopOnFailure(child) {
  child.on("exit", (code) => {
    if (code !== null && code !== 0) {
      process.exitCode = code;
      stopAll();
    }
  });
}
stopOnFailure(watcher);
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);
