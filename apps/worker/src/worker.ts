/**
 * The background worker process. In M1 it only starts and stops cleanly: the job queues (the
 * outbox relay, then the media, AI and YouTube jobs) arrive in M6 and Step 2. Until then it says
 * so and never claims to have done any work.
 */
export interface Worker {
  /** Resolves once the worker has stopped. */
  readonly stopped: Promise<void>;
  /** Asks the worker to stop. Safe to call more than once (SIGINT and SIGTERM can both arrive). */
  stop(): void;
}

export function startWorker(log: (message: string) => void = console.info): Worker {
  const { promise: stopped, resolve: markStopped } = Promise.withResolvers<void>();
  // Keeps the process alive until stop(): there are no queues to listen on yet.
  const keepAlive = setInterval(() => undefined, 60_000);
  let running = true;
  log("worker started; no job queues are configured yet");

  return {
    stopped,
    stop() {
      if (!running) return;
      running = false;
      clearInterval(keepAlive);
      log("worker stopped");
      markStopped();
    },
  };
}
