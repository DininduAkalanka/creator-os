/**
 * The personal-organization bootstrap (PLAN.md §4, §6 item 6): idempotent, safe under concurrent
 * first sign-ins, impossible without a user context, and the only way to create an organization.
 */
import { newId } from "@creatoros/contracts";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { memberships } from "../src/schema.js";
import type { TenantDatabase } from "../src/tenancy.js";
import {
  adminQuery,
  appDatabase,
  bootstrap,
  createDatabase,
  createTenant,
  failureCode,
  type TestDatabase,
} from "./db.js";

let db: TestDatabase;
let app: TenantDatabase;

beforeAll(async () => {
  db = await createDatabase("migrated");
  app = appDatabase(db, 10);
});

afterAll(async () => {
  await app.close();
  await db.drop();
});

async function countFor(userId: string) {
  const { rows } = await adminQuery(
    `SELECT (SELECT count(*)::int FROM organizations WHERE personal_owner_user_id = $1) AS orgs,
            (SELECT count(*)::int FROM memberships WHERE user_id = $1) AS memberships,
            (SELECT count(*)::int FROM audit_logs WHERE user_id = $1) AS audit`,
    { database: db.name, values: [userId] },
  );
  return rows[0] as { orgs: number; memberships: number; audit: number };
}

describe("app.bootstrap_personal_org", () => {
  it("creates one organization, an OWNER membership and an audit row", async () => {
    const { userId, orgId } = await createTenant(db, app, "Lena");
    expect(await countFor(userId)).toEqual({ orgs: 1, memberships: 1, audit: 1 });
    const own = await app.withOrgTx({ orgId, userId }, (tx) => tx.select().from(memberships));
    expect(own).toEqual([
      expect.objectContaining({ organizationId: orgId, userId, role: "OWNER" }),
    ]);
  });

  it("returns the same organization on every later call", async () => {
    const { userId, orgId } = await createTenant(db, app, "Kenji");
    expect(await bootstrap(app, userId, "another name")).toBe(orgId);
    expect(await countFor(userId)).toEqual({ orgs: 1, memberships: 1, audit: 1 });
  });

  it("creates exactly one organization under 10 concurrent first sign-ins", async () => {
    const userId = newId();
    const auth = await db.connect("auth");
    await auth.query("INSERT INTO users (id, email) VALUES ($1, $2)", [
      userId,
      `race-${userId}@example.com`,
    ]);
    await auth.end();

    const results = await Promise.all(
      Array.from({ length: 10 }, () => bootstrap(app, userId, "Race")),
    );
    expect(new Set(results).size).toBe(1);
    expect(await countFor(userId)).toEqual({ orgs: 1, memberships: 1, audit: 1 });
  });

  it("is refused without a user context", async () => {
    const client = await db.connect("app");
    try {
      const call = client.query("SELECT app.bootstrap_personal_org($1, $2, $3, 'x')", [
        newId(),
        newId(),
        newId(),
      ]);
      expect(await failureCode(call)).toBe("42501");
    } finally {
      await client.end();
    }
  });

  it("is the only way to create an organization: app_user can't insert one", async () => {
    const { userId } = await createTenant(db, app, "Omar");
    const insert = app.withUserTx(userId, (tx) =>
      tx.execute(
        sql`INSERT INTO organizations (id, name, personal_owner_user_id) VALUES (${newId()}, 'x', ${userId})`,
      ),
    );
    expect(await failureCode(insert)).toBe("42501");
  });

  it("can't be reached by auth_service for tenant tables", async () => {
    const auth = await db.connect("auth");
    try {
      expect(await failureCode(auth.query("SELECT * FROM memberships"))).toBe("42501");
      expect(await failureCode(auth.query("SELECT * FROM organizations"))).toBe("42501");
    } finally {
      await auth.end();
    }
  });
});
