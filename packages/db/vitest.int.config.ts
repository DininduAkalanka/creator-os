import { defineConfig } from "vitest/config";

// `pnpm test:int`: needs Docker. One PostgreSQL container for the run (test/global-setup.ts); each
// test file works in its own clone of the migrated database, so files can run in parallel.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.int.test.ts"],
    globalSetup: ["test/global-setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
});
