import { describe, expect, it } from "vitest";
import { startWorker } from "./worker.js";

describe("the worker process", () => {
  it("runs until asked to stop, then resolves `stopped`", async () => {
    const messages: string[] = [];
    const worker = startWorker((message) => messages.push(message));

    let stopped = false;
    void worker.stopped.then(() => {
      stopped = true;
    });
    await Promise.resolve();
    expect(stopped).toBe(false);

    worker.stop();
    await worker.stopped;
    expect(stopped).toBe(true);
    expect(messages).toEqual([
      "worker started; no job queues are configured yet",
      "worker stopped",
    ]);
  });

  it("treats a second stop as a no-op (SIGINT then SIGTERM)", async () => {
    const messages: string[] = [];
    const worker = startWorker((message) => messages.push(message));
    worker.stop();
    worker.stop();
    await worker.stopped;
    expect(messages.filter((message) => message === "worker stopped")).toHaveLength(1);
  });
});
