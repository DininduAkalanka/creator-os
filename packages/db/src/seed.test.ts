import { idSchema } from "@creatoros/contracts";
import { describe, expect, it } from "vitest";
import { SEED, seed } from "./seed.js";

describe("seed", () => {
  it("refuses to run in production, before connecting anywhere", async () => {
    const nowhere = {
      authUrl: "postgres://x:y@127.0.0.1:9/x",
      appUrl: "postgres://x:y@127.0.0.1:9/x",
    };
    await expect(seed(nowhere, { NODE_ENV: "production" })).rejects.toThrow("development only");
  });

  it("uses fixed UUID v7 IDs, so withOrgTx accepts them and reruns change nothing", () => {
    const ids = [
      SEED.saraInAvasOrg,
      ...[SEED.ava, SEED.sara].flatMap((u) => [u.userId, u.orgId, u.membershipId, u.auditId]),
    ];
    for (const id of ids) expect(idSchema.safeParse(id).success, id).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
