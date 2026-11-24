// Fixture for test/import-rules.test.ts: deliberate violations. Never imported by real code.
import "./states.js"; // allowed: its own file
import "../../ui/src/index.js"; // contracts-imports-nothing-internal
