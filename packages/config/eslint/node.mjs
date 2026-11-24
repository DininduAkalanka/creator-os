import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * Lint preset for the TypeScript packages and the Node apps (api, worker). Type-aware, so it
 * catches floating promises and unsafe `any` flows, not just style. The Next.js apps use
 * eslint-config-next instead.
 *
 * Usage, in a package's eslint.config.mjs:
 *   import { nodeConfig } from "@creatoros/config/eslint/node";
 *   export default nodeConfig(import.meta.dirname);
 *
 * @param {string} tsconfigRootDir the package folder, so each package uses its own tsconfig
 */
export function nodeConfig(tsconfigRootDir) {
  return defineConfig([
    globalIgnores(["dist/**", "coverage/**"]),
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
      },
    },
    // Plain JavaScript files (configs, scripts) are not part of a TypeScript project.
    {
      files: ["**/*.{js,mjs,cjs}"],
      extends: [tseslint.configs.disableTypeChecked],
    },
  ]);
}
