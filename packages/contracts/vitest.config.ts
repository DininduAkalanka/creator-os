import { defineConfig } from "vitest/config";

// `pnpm test` measures coverage and fails below 95% (M2 exit test, PLAN.md §6). `include` lists
// every source file, so a file no test loads still counts against the total.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text"],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
    },
  },
});
