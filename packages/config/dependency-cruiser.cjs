/**
 * Import rules for the monorepo: AGENTS.md §3 and PLAN.md §1, enforced (proposal P-10).
 * Run from the repo root with `pnpm lint:deps`; CI runs it on every pull request.
 * Paths in the rules are relative to the repo root. Tested in test/import-rules.test.ts.
 *
 * @type {import("dependency-cruiser").IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-app-to-app",
      comment: "Apps never import other apps (AGENTS.md §3).",
      severity: "error",
      from: { path: "^apps/([^/]+)/" },
      to: { path: "^apps/", pathNot: "^apps/$1/" },
    },
    {
      name: "no-package-to-app",
      comment: "Packages never import apps (AGENTS.md §3).",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "contracts-imports-nothing-internal",
      comment: "packages/contracts imports nothing internal (AGENTS.md §3).",
      severity: "error",
      from: { path: "^packages/contracts/" },
      to: { path: "^(apps|packages|tools)/", pathNot: "^packages/contracts/" },
    },
    {
      name: "packages-only-depend-on-contracts",
      comment: "db, ai, media, api-client and ui may import only contracts (PLAN.md §1).",
      severity: "error",
      from: { path: "^packages/(db|ai|media|api-client|ui)/" },
      to: { path: "^packages/", pathNot: "^packages/(contracts|$1)/" },
    },
    {
      name: "web-no-server-packages",
      comment:
        "apps/web never imports db, ai or media: they hold server code and secrets (PLAN.md §1).",
      severity: "error",
      from: { path: "^apps/web/" },
      to: { path: "^packages/(db|ai|media)/" },
    },
    {
      name: "nothing-imports-tools",
      comment: "Apps and packages never import tools/ (PLAN.md §1).",
      severity: "error",
      from: { path: "^(apps|packages)/" },
      to: { path: "^tools/" },
    },
    {
      name: "no-deep-package-import",
      comment: "Import a package through its entry point, never its internal files (PLAN.md §1).",
      severity: "error",
      from: { path: "^(apps|packages|tools)/([^/]+)/" },
      to: {
        path: "^packages/[^/]+/src/",
        pathNot: ["^packages/$2/", "^packages/[^/]+/src/index\\.tsx?$"],
      },
    },
    {
      name: "no-circular",
      comment: "Circular imports make load order and testing fragile.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    includeOnly: "^(apps|packages|tools)/",
    exclude: {
      path: [
        "(^|/)node_modules/",
        "(^|/)dist/",
        "(^|/)\\.next/",
        "^packages/config/test/fixtures/",
      ],
    },
    doNotFollow: { path: "(^|/)node_modules/" },
    // Type-only imports count too: a type import across a boundary is still a dependency.
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      // "@creatoros/source" lets a workspace package point the rules at its source files,
      // so `pnpm lint:deps` works before anything is built.
      conditionNames: ["@creatoros/source", "import", "require", "node", "default"],
    },
  },
};
