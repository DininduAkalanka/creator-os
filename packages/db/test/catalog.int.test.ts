/**
 * Facts the tenancy design relies on, read from PostgreSQL's catalogs (PLAN.md §6 items 1, 2, 8).
 * The RLS meta-test is automatic: a future table with an organization_id column and no forced RLS
 * fails here without anyone writing a new test.
 */
import { ROLES } from "@creatoros/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminQuery, createDatabase, type TestDatabase } from "./db.js";

let db: TestDatabase;

beforeAll(async () => {
  db = await createDatabase("migrated");
});

afterAll(async () => {
  await db.drop();
});

const query = async (text: string) => (await adminQuery(text, { database: db.name })).rows;

describe("database roles (PLAN.md §3.1)", () => {
  it("can't bypass row-level security, and only tenant_bootstrap can't log in", async () => {
    const rows = await query(
      `SELECT rolname, rolsuper, rolbypassrls, rolcanlogin, rolcreaterole, rolcreatedb
         FROM pg_roles
        WHERE rolname IN ('creatoros_migrator', 'app_user', 'auth_service', 'tenant_bootstrap')
        ORDER BY rolname`,
    );
    expect(rows).toEqual([
      {
        rolname: "app_user",
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: true,
        rolcreaterole: false,
        rolcreatedb: false,
      },
      {
        rolname: "auth_service",
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: true,
        rolcreaterole: false,
        rolcreatedb: false,
      },
      {
        rolname: "creatoros_migrator",
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: true,
        rolcreaterole: false,
        rolcreatedb: false,
      },
      {
        rolname: "tenant_bootstrap",
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: false,
        rolcreaterole: false,
        rolcreatedb: false,
      },
    ]);
  });

  it("app_user and auth_service own nothing", async () => {
    const rows = await query(
      `SELECT r.rolname, count(c.oid)::int AS owned
         FROM pg_roles r LEFT JOIN pg_class c ON c.relowner = r.oid
        WHERE r.rolname IN ('app_user', 'auth_service') GROUP BY r.rolname ORDER BY r.rolname`,
    );
    expect(rows).toEqual([
      { rolname: "app_user", owned: 0 },
      { rolname: "auth_service", owned: 0 },
    ]);
  });

  it("the migrator is a member of tenant_bootstrap without inheriting it (approved in M3)", async () => {
    const rows = await query(
      `SELECT m.inherit_option, m.set_option FROM pg_auth_members m
         JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles u ON u.oid = m.member
        WHERE r.rolname = 'tenant_bootstrap' AND u.rolname = 'creatoros_migrator'`,
    );
    expect(rows).toEqual([{ inherit_option: false, set_option: true }]);
  });

  it("the bootstrap function belongs to tenant_bootstrap, runs as it, and PUBLIC can't call it", async () => {
    const rows = await query(
      `SELECT pg_get_userbyid(p.proowner) AS owner, p.prosecdef AS security_definer,
              p.proconfig AS config, has_function_privilege('public', p.oid, 'EXECUTE') AS public_execute,
              has_function_privilege('app_user', p.oid, 'EXECUTE') AS app_execute
         FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'app' AND p.proname = 'bootstrap_personal_org'`,
    );
    expect(rows).toEqual([
      {
        owner: "tenant_bootstrap",
        security_definer: true,
        config: ['search_path=""'],
        public_execute: false,
        app_execute: true,
      },
    ]);
  });

  it("tenant_bootstrap can't create objects in the app schema", async () => {
    const rows = await query(
      `SELECT has_schema_privilege('tenant_bootstrap', 'app', 'CREATE') AS can_create`,
    );
    expect(rows).toEqual([{ can_create: false }]);
  });
});

describe("row-level security on every tenant table (PLAN.md §6 item 2)", () => {
  it("is enabled and forced, with at least one policy, on every table with organization_id", async () => {
    const rows = await query(
      `SELECT c.relname AS table, c.relrowsecurity AS enabled, c.relforcerowsecurity AS forced,
              (SELECT count(*)::int FROM pg_policy p WHERE p.polrelid = c.oid) AS policies
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
          AND (c.relname IN ('organizations', 'users')
               OR EXISTS (SELECT 1 FROM pg_attribute a
                           WHERE a.attrelid = c.oid AND a.attname = 'organization_id' AND NOT a.attisdropped))
        ORDER BY c.relname`,
    );
    expect(rows.map((row) => row.table)).toEqual([
      "audit_logs",
      "memberships",
      "organizations",
      "users",
    ]);
    for (const row of rows)
      expect(row, String(row.table)).toMatchObject({ enabled: true, forced: true });
    for (const row of rows) expect(row.policies, String(row.table)).toBeGreaterThan(0);
  });

  it("every tenant table has an (organization_id, created_at) index (AGENTS.md §4.1)", async () => {
    const rows = await query(
      `SELECT t.relname AS table, bool_or(pg_get_indexdef(i.indexrelid) LIKE '%(organization_id, created_at)%') AS indexed
         FROM pg_class t JOIN pg_namespace n ON n.oid = t.relnamespace
         JOIN pg_index i ON i.indrelid = t.oid
        WHERE n.nspname = 'public'
          AND EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = t.oid AND a.attname = 'organization_id')
        GROUP BY t.relname ORDER BY t.relname`,
    );
    expect(rows).toEqual([
      { table: "audit_logs", indexed: true },
      { table: "memberships", indexed: true },
    ]);
  });
});

describe("enum parity (PLAN.md §6 item 8)", () => {
  it("the memberships.role CHECK lists exactly the contracts ROLES", async () => {
    const rows = await query(
      `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'memberships_role_check'`,
    );
    const listed = [...String(rows[0]?.def).matchAll(/'([A-Z_]+)'/g)].map((match) => match[1]);
    expect(listed).toEqual([...ROLES]);
  });
});
