/**
 * M3 exit tests 1 and 2 (prompts/01) and PLAN.md §6 items 3-5: as app_user, organization A can't
 * select, insert, update or delete organization B's rows; with no context, nothing is visible;
 * a pooled connection never carries the context into the next transaction.
 */
import { newId } from "@creatoros/contracts";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TenantDatabase } from "../src/tenancy.js";
import {
  adminQuery,
  appDatabase,
  createDatabase,
  createTenant,
  failureCode,
  type Tenant,
  type TestDatabase,
} from "./db.js";

const INSUFFICIENT_PRIVILEGE = "42501"; // no grant, or a row that fails an RLS WITH CHECK

let db: TestDatabase;
let app: TenantDatabase;
let a: Tenant;
let b: Tenant;
let snapshotOfB: string;

/** B's rows in every table, read as the superuser, to prove A's attempts changed nothing. */
async function rowsOfB(): Promise<string> {
  const { rows } = await adminQuery(
    `SELECT json_build_object(
       'org', (SELECT row_to_json(o) FROM organizations o WHERE o.id = $1),
       'user', (SELECT row_to_json(u) FROM users u WHERE u.id = $2),
       'memberships', (SELECT json_agg(m ORDER BY m.id) FROM memberships m WHERE m.organization_id = $1),
       'audit', (SELECT json_agg(l ORDER BY l.id) FROM audit_logs l WHERE l.organization_id = $1)
     ) AS b`,
    { database: db.name, values: [b.orgId, b.userId] },
  );
  return JSON.stringify(rows[0]);
}

beforeAll(async () => {
  db = await createDatabase("migrated");
  app = appDatabase(db);
  a = await createTenant(db, app, "Ava");
  b = await createTenant(db, app, "سارة"); // a right-to-left name, as AGENTS.md §5 asks
  snapshotOfB = await rowsOfB();
});

afterAll(async () => {
  await app.close();
  await db.drop();
});

/** Runs one statement as app_user inside A's organization and returns rows changed or read. */
function asA(statement: ReturnType<typeof sql>): Promise<number> {
  return app.withOrgTx({ orgId: a.orgId, userId: a.userId }, async (tx) => {
    const result = await tx.execute(statement);
    return result.rowCount ?? result.rows.length;
  });
}

describe("exit test 1: organization A can't touch organization B's rows (as app_user)", () => {
  // Positive controls: A sees its own rows, so the zeros below are filtering, not a broken setup.
  it.each([
    ["organizations", () => sql`SELECT 1 FROM organizations WHERE id = ${a.orgId}`],
    ["memberships", () => sql`SELECT 1 FROM memberships WHERE organization_id = ${a.orgId}`],
    ["audit_logs", () => sql`SELECT 1 FROM audit_logs WHERE organization_id = ${a.orgId}`],
    ["users", () => sql`SELECT 1 FROM users WHERE id = ${a.userId}`],
  ])("A sees its own %s row", async (_table, statement) => {
    expect(await asA(statement())).toBe(1);
  });

  it.each([
    ["organizations", () => sql`SELECT * FROM organizations WHERE id = ${b.orgId}`],
    ["memberships", () => sql`SELECT * FROM memberships WHERE organization_id = ${b.orgId}`],
    ["audit_logs", () => sql`SELECT * FROM audit_logs WHERE organization_id = ${b.orgId}`],
    ["users", () => sql`SELECT * FROM users WHERE id = ${b.userId}`],
  ])("SELECT of B's %s returns no rows", async (_table, statement) => {
    expect(await asA(statement())).toBe(0);
  });

  it.each([
    ["organizations", () => sql`UPDATE organizations SET name = 'taken' WHERE id = ${b.orgId}`],
    [
      "memberships",
      () => sql`UPDATE memberships SET role = 'REVIEWER' WHERE organization_id = ${b.orgId}`,
    ],
    ["users", () => sql`UPDATE users SET name = 'taken' WHERE id = ${b.userId}`],
  ])("UPDATE of B's %s changes no rows", async (_table, statement) => {
    expect(await asA(statement())).toBe(0);
  });

  it("UPDATE of B's audit_logs is refused: the log is append-only", async () => {
    const statement = sql`UPDATE audit_logs SET action = 'x' WHERE organization_id = ${b.orgId}`;
    expect(await failureCode(asA(statement))).toBe(INSUFFICIENT_PRIVILEGE);
  });

  it("DELETE of B's memberships changes no rows", async () => {
    expect(await asA(sql`DELETE FROM memberships WHERE organization_id = ${b.orgId}`)).toBe(0);
  });

  it.each([
    ["organizations", () => sql`DELETE FROM organizations WHERE id = ${b.orgId}`],
    ["audit_logs", () => sql`DELETE FROM audit_logs WHERE organization_id = ${b.orgId}`],
    ["users", () => sql`DELETE FROM users WHERE id = ${b.userId}`],
  ])("DELETE of B's %s is refused", async (_table, statement) => {
    expect(await failureCode(asA(statement()))).toBe(INSUFFICIENT_PRIVILEGE);
  });

  it.each([
    [
      "memberships",
      () =>
        sql`INSERT INTO memberships (id, organization_id, user_id, role) VALUES (${newId()}, ${b.orgId}, ${a.userId}, 'OWNER')`,
    ],
    [
      "audit_logs",
      () =>
        sql`INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type) VALUES (${newId()}, ${b.orgId}, ${a.userId}, 'x', 'organization')`,
    ],
    [
      "organizations",
      () => sql`INSERT INTO organizations (id, name) VALUES (${newId()}, 'mine now')`,
    ],
    [
      "users",
      () => sql`INSERT INTO users (id, email) VALUES (${newId()}, ${`x-${newId()}@example.com`})`,
    ],
  ])("INSERT into %s for B (or at all) is refused", async (_table, statement) => {
    expect(await failureCode(asA(statement()))).toBe(INSUFFICIENT_PRIVILEGE);
  });

  it("left every one of B's rows exactly as it was", async () => {
    expect(await rowsOfB()).toBe(snapshotOfB);
  });
});

describe("exit test 2: with no organization context, no tenant rows are visible", () => {
  it.each(["organizations", "memberships", "audit_logs", "users"])(
    "a plain app_user query on %s returns no rows",
    async (table) => {
      const client = await db.connect("app");
      try {
        const { rows } = await client.query(`SELECT count(*)::int AS n FROM ${table}`);
        expect(rows[0]).toEqual({ n: 0 });
      } finally {
        await client.end();
      }
    },
  );

  it("and INSERT is refused", async () => {
    const client = await db.connect("app");
    try {
      const insert = client.query(
        "INSERT INTO memberships (id, organization_id, user_id, role) VALUES ($1, $2, $3, 'OWNER')",
        [newId(), a.orgId, a.userId],
      );
      expect(await failureCode(insert)).toBe(INSUFFICIENT_PRIVILEGE);
    } finally {
      await client.end();
    }
  });
});

describe("the context ends with its transaction (PLAN.md §6 item 5)", () => {
  it("a reused connection has no organization after the transaction commits", async () => {
    const client = await db.connect("app");
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.current_org_id', $1, true)", [a.orgId]);
      await client.query("COMMIT");
      const { rows } = await client.query(
        `SELECT current_setting('app.current_org_id', true) AS raw, app.current_org_id() AS org,
                (SELECT count(*)::int FROM memberships) AS visible`,
      );
      // '' (not NULL) once the setting has been used: NULLIF in app.current_org_id() handles it.
      expect(rows[0]).toEqual({ raw: "", org: null, visible: 0 });
    } finally {
      await client.end();
    }
  });

  it("withOrgTx and withUserTx on one pooled connection don't see each other's context", async () => {
    const single = appDatabase(db, 1);
    try {
      const inA = await single.withOrgTx({ orgId: a.orgId }, async (tx) => {
        const r = await tx.execute<{ org: string }>(sql`SELECT app.current_org_id() AS org`);
        return r.rows[0]?.org;
      });
      const afterwards = await single.withUserTx(b.userId, async (tx) => {
        const r = await tx.execute<{ org: string | null; orgs: string[] | null }>(
          sql`SELECT app.current_org_id() AS org,
                     (SELECT array_agg(organization_id::text) FROM memberships) AS orgs`,
        );
        return r.rows[0];
      });
      expect(inA).toBe(a.orgId);
      expect(afterwards).toEqual({ org: null, orgs: [b.orgId] });
    } finally {
      await single.close();
    }
  });
});
