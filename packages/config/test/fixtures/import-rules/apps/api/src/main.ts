// Fixture for test/import-rules.test.ts: deliberate violations. Never imported by real code.
import "../../../packages/contracts/src/states.js"; // no-deep-package-import
import "../../../packages/contracts/src/index.js"; // allowed: an entry point
