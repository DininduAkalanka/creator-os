import { startWorker } from "./worker.js";

const worker = startWorker();
// Stop cleanly on Ctrl+C and on container stop.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => worker.stop());
}
await worker.stopped;
