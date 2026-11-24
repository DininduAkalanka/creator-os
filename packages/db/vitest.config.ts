import { defineConfig } from "vitest/config";

// Unit tests: no database needed. The integration tests are in vitest.int.config.ts.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
