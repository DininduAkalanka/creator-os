import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { cruise, type IConfiguration, type ICruiseResult } from "dependency-cruiser";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const config = require("../dependency-cruiser.cjs") as IConfiguration;
const fixtures = fileURLToPath(new URL("./fixtures/import-rules", import.meta.url));

/** Runs the real rule set over the fixture repo and returns each violation as "rule: from -> to". */
async function violations(): Promise<string[]> {
  const { output } = await cruise(["apps", "packages", "tools"], {
    ...config.options,
    ruleSet: { forbidden: config.forbidden },
    validate: true,
    baseDir: fixtures,
  });
  const result = output as ICruiseResult;
  return result.summary.violations
    .map((violation) => `${violation.rule.name}: ${violation.from} -> ${violation.to}`)
    .sort();
}

describe("import rules (AGENTS.md §3, PLAN.md §1)", () => {
  it("catches every kind of forbidden import, and nothing else", async () => {
    expect(await violations()).toEqual(
      [
        "no-app-to-app: apps/web/src/page.ts -> apps/api/src/main.ts",
        "web-no-server-packages: apps/web/src/page.ts -> packages/db/src/index.ts",
        "no-deep-package-import: apps/api/src/main.ts -> packages/contracts/src/states.ts",
        "nothing-imports-tools: apps/worker/src/main.ts -> tools/concierge/src/run.ts",
        "contracts-imports-nothing-internal: packages/contracts/src/index.ts -> packages/ui/src/index.ts",
        "packages-only-depend-on-contracts: packages/db/src/index.ts -> packages/ui/src/index.ts",
        "no-package-to-app: packages/db/src/index.ts -> apps/worker/src/main.ts",
        // A cycle is reported once, at the first edge found, not once per edge.
        "no-circular: packages/media/src/index.ts -> packages/media/src/loop.ts",
      ].sort(),
    );
  });
});
