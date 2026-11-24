// Fixture for test/import-rules.test.ts: deliberate violations. Never imported by real code.
import "../../contracts/src/index.js"; // allowed: db may import contracts
import "../../ui/src/index.js"; // packages-only-depend-on-contracts
import "../../../apps/worker/src/main.js"; // no-package-to-app
