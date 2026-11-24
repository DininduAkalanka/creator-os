/** The development seed writes through RLS like the app does, and running it twice changes nothing. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SEED, seed } from "../src/seed.js";
import { adminQuery, createDatabase, type TestDatabase } from "./db.js";

let db: TestDatabase;

beforeAll(async () => {
  db = await createDatabase("migrated");
});

afterAll(async () => {
  await db.drop();
});

async function contents() {
  const { rows } = await adminQuery(
    `SELECT (SELECT count(*)::int FROM users) AS users,
            (SELECT count(*)::int FROM organizations) AS orgs,
            (SELECT json_agg(json_build_object('org', organization_id, 'user', user_id, 'role', role)
                             ORDER BY id) FROM memberships) AS memberships,
            (SELECT count(*)::int FROM audit_logs) AS audit`,
    { database: db.name },
  );
  return rows[0];
}

describe("pnpm db:seed", () => {
  it("creates two users, their organizations and one shared membership, and is idempotent", async () => {
    const urls = { authUrl: db.url("auth"), appUrl: db.url("app") };
    await seed(urls, {});
    const first = await contents();
    expect(first).toEqual({
      users: 2,
      orgs: 2,
      memberships: [
        { org: SEED.ava.orgId, user: SEED.ava.userId, role: "OWNER" },
        { org: SEED.sara.orgId, user: SEED.sara.userId, role: "OWNER" },
        { org: SEED.ava.orgId, user: SEED.sara.userId, role: "EDITOR" },
      ],
      audit: 2,
    });
    await seed(urls, {});
    expect(await contents()).toEqual(first);
  });
});
