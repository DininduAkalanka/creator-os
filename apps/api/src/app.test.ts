import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("the API app", () => {
  it("starts, answers HTTP under /api/v1, and shuts down", async () => {
    const app = await createApp({ logger: false });
    await app.listen(0);
    try {
      const url = await app.getUrl();
      // No routes yet (they arrive in M4-M5), so any path is a clean 404 from the HTTP layer.
      const response = await fetch(`${url}/api/v1/not-a-route`);
      expect(response.status).toBe(404);
    } finally {
      await app.close();
    }
  });
});
