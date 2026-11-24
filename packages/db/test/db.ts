/** Helpers for the integration tests: a fresh database per test file, raw clients, SQLSTATEs. */
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { newId } from "@creatoros/contracts";
import { sql } from "drizzle-orm";
import pg from "pg";
import { inject } from "vitest";
import { loadDatabaseGrantsSql } from "../src/roles.js";
import { createTenantDatabase, type TenantDatabase } from "../src/tenancy.js";
import { connectionUrl, type Role } from "./global-setup.js";

const info = () => inject("pg");

/**
 * Runs one statement as the container's superuser (by default in the "postgres" database). Rows
 * are typed as unknown values unless the caller names their shape.
 */
export async function adminQuery<R extends pg.QueryResultRow = Record<string, unknown>>(
  text: string,
  options: { readonly database?: string; readonly values?: readonly unknown[] } = {},
): Promise<pg.QueryResult<R>> {
  const database = options.database ?? "postgres";
  const client = new pg.Client({ connectionString: connectionUrl(info(), "admin", database) });
  await client.connect();
  try {
    return await client.query<R>(
      text,
      options.values === undefined ? undefined : [...options.values],
    );
  } finally {
    await client.end();
  }
}

export interface TestDatabase {
  readonly name: string;
  url(role: Role): string;
  /** A raw client for one role, for statements the package itself never exposes. */
  connect(role: Role): Promise<pg.Client>;
  drop(): Promise<void>;
}

/**
 * A new database: a clone of the migrated template, or an empty one (for the migration tests).
 * Clones of one template can't start at the same moment, so a busy template is retried.
 */
export async function createDatabase(kind: "migrated" | "empty"): Promise<TestDatabase> {
  const name = `t_${randomBytes(6).toString("hex")}`;
  const template = kind === "migrated" ? "creatoros" : "template0";
  for (let attempt = 1; ; attempt += 1) {
    try {
      await adminQuery(`CREATE DATABASE ${name} TEMPLATE ${template}`);
      break;
    } catch (error) {
      if (sqlState(error) !== "55006" || attempt === 20) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }
  // A new database needs the per-database grants, exactly as a new environment does.
  if (kind === "empty") await adminQuery(loadDatabaseGrantsSql(), { database: name });
  return {
    name,
    url: (role) => connectionUrl(info(), role, name),
    async connect(role) {
      const client = new pg.Client({ connectionString: connectionUrl(info(), role, name) });
      await client.connect();
      return client;
    },
    drop: async () => {
      await adminQuery(`DROP DATABASE ${name} WITH (FORCE)`);
    },
  };
}

/** The SQLSTATE of a PostgreSQL error, also when Drizzle wrapped it (error.cause). */
export function sqlState(error: unknown): string | undefined {
  for (let current: unknown = error; current instanceof Error; current = current.cause) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
  }
  return undefined;
}

/** Resolves to the SQLSTATE the promise failed with; fails the test if it succeeded. */
export async function failureCode(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
  } catch (error) {
    return sqlState(error);
  }
  throw new Error("Expected the statement to fail, but it succeeded.");
}

export interface Tenant {
  readonly userId: string;
  readonly orgId: string;
}

/** A user (created as auth_service, like sign-up in M4) with a bootstrapped personal organization. */
export async function createTenant(
  db: TestDatabase,
  app: TenantDatabase,
  label: string,
): Promise<Tenant> {
  const userId = newId();
  const auth = await db.connect("auth");
  try {
    await auth.query("INSERT INTO users (id, name, email) VALUES ($1, $2, $3)", [
      userId,
      label,
      `${label.toLowerCase()}-${userId}@example.com`,
    ]);
  } finally {
    await auth.end();
  }
  const orgId = await bootstrap(app, userId, `${label}'s workspace`);
  return { userId, orgId };
}

/** Calls app.bootstrap_personal_org with new IDs inside withUserTx, as the app will (PLAN.md §4). */
export async function bootstrap(
  app: TenantDatabase,
  userId: string,
  orgName: string,
): Promise<string> {
  return app.withUserTx(userId, async (tx) => {
    const result = await tx.execute<{ org_id: string }>(
      sql`SELECT app.bootstrap_personal_org(${newId()}, ${newId()}, ${newId()}, ${orgName}) AS org_id`,
    );
    const orgId = result.rows[0]?.org_id;
    if (orgId === undefined) throw new Error("bootstrap_personal_org returned no row");
    return orgId;
  });
}

export function appDatabase(db: TestDatabase, maxConnections?: number): TenantDatabase {
  return createTenantDatabase(
    db.url("app"),
    maxConnections === undefined ? {} : { maxConnections },
  );
}

const run = promisify(execFile);

/** pg_dump --schema-only inside the container, without the random \restrict keys of PG 18. */
export async function schemaDump(database: string): Promise<string> {
  const { stdout } = await run("docker", [
    "exec",
    info().containerId,
    "pg_dump",
    "--schema-only",
    "--username",
    info().adminUser,
    database,
  ]);
  return stdout
    .split("\n")
    .filter((line) => !/^\\(un)?restrict /.test(line))
    .join("\n");
}
