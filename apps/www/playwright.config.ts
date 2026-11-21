import { defineConfig, devices } from "@playwright/test";

/*
 * End-to-end tests against the production build (`next start`), so run `pnpm build` first
 * (turbo does this for `pnpm test:e2e`).
 * Locally the tests use the installed Microsoft Edge: no browser download. CI installs Chromium.
 */
const port = Number(process.env.E2E_PORT ?? 3200);
const baseURL = `http://localhost:${port}`;
const channel = process.env.CI ? undefined : (process.env.PW_CHANNEL ?? "msedge");
const withChannel = channel ? { channel } : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  // Many browsers in parallel against one local server are slow: allow for it.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...withChannel } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...withChannel } },
  ],
  webServer: {
    command: `pnpm exec next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
