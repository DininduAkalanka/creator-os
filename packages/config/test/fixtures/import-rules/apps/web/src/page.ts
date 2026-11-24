// Fixture for test/import-rules.test.ts: deliberate violations. Never imported by real code.
import "../../api/src/main.js"; // no-app-to-app
import "../../../packages/db/src/index.js"; // web-no-server-packages
import "../../../packages/contracts/src/index.js"; // allowed: an entry point
