import { newId } from "@creatoros/contracts";
import { afterAll, describe, expect, it } from "vitest";
import { createTenantDatabase } from "./tenancy.js";

// Nothing listens on port 9: any attempt to connect would fail with a connection error instead.
const db = createTenantDatabase("postgres://app_user:unused@127.0.0.1:9/creatoros");
afterAll(() => db.close());

const neverRuns = () => Promise.reject(new Error("the callback must not run"));

describe("withOrgTx / withUserTx check IDs before any SQL", () => {
  it.each([
    ["an empty org ID", { orgId: "" }],
    ["a non-UUID org ID", { orgId: "org_123" }],
    ["SQL in the org ID", { orgId: "'; RESET ROLE; --" }],
    ["a UUID v4 org ID", { orgId: "3f1c2b9e-1a2b-4c3d-8e9f-0a1b2c3d4e5f" }],
    ["a bad user ID", { orgId: newId(), userId: "user_1" }],
  ])("withOrgTx refuses %s", async (_label, ctx) => {
    await expect(db.withOrgTx(ctx, neverRuns)).rejects.toThrow(/must be a UUID v7/);
  });

  it("withUserTx refuses a bad user ID", async () => {
    await expect(db.withUserTx("not-a-uuid", neverRuns)).rejects.toThrow(
      /userId must be a UUID v7/,
    );
  });
});
