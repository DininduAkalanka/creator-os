/**
 * Tenancy (AGENTS.md §4.1, PLAN.md §3.3): every request and every job reads and writes inside
 * withOrgTx, which sets the organization (and user) for the transaction. The RLS policies of
 * migration 001 read them back through app.current_org_id() and app.current_user_id().
 *
 * - set_config(name, value, true) is SET LOCAL with bind parameters: the setting ends with the
 *   transaction, so a pooled connection never carries it into the next request, and a value is
 *   never spliced into SQL text. It also works behind transaction-mode poolers.
 * - IDs are checked as UUID v7 before anything reaches the database.
 * - This module is the only way apps reach tenant tables: there is no raw client export.
 * - Never hold a transaction open across slow work (FFmpeg, a model call): read in one withOrgTx,
 *   do the work outside it, write the result in a second one.
 */
import { idSchema } from "@creatoros/contracts";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export type TenantTx = Parameters<Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]>[0];

export interface OrgContext {
  readonly orgId: string;
  /** The signed-in user, when there is one (the API sets it; most jobs don't). */
  readonly userId?: string;
}

export interface TenantDatabase {
  /** Runs `fn` in one transaction scoped to an organization. */
  withOrgTx<T>(ctx: OrgContext, fn: (tx: TenantTx) => Promise<T>): Promise<T>;
  /** Runs `fn` in one transaction scoped to a user only: GET /me, the personal-org bootstrap. */
  withUserTx<T>(userId: string, fn: (tx: TenantTx) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface TenantDatabaseOptions {
  /** Most connections the pool opens. Default 10. */
  readonly maxConnections?: number;
}

function checkId(value: string, field: string): string {
  const result = idSchema.safeParse(value);
  if (!result.success) throw new Error(`${field} must be a UUID v7.`);
  return result.data;
}

/** A pool for the app_user role (API, worker). Connects lazily, on the first transaction. */
export function createTenantDatabase(
  connectionString: string,
  options: TenantDatabaseOptions = {},
): TenantDatabase {
  const pool = new pg.Pool({ connectionString, max: options.maxConnections ?? 10 });
  const db = drizzle({ client: pool, schema });

  function inContext<T>(orgId: string, userId: string, fn: (tx: TenantTx) => Promise<T>) {
    return db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT set_config('app.current_org_id', ${orgId}, true), set_config('app.current_user_id', ${userId}, true)`,
      );
      return fn(tx);
    });
  }

  return {
    // `async` so that a bad ID rejects the promise instead of throwing synchronously.
    async withOrgTx(ctx, fn) {
      const orgId = checkId(ctx.orgId, "orgId");
      const userId = ctx.userId === undefined ? "" : checkId(ctx.userId, "userId");
      return inContext(orgId, userId, fn);
    },
    async withUserTx(userId, fn) {
      return inContext("", checkId(userId, "userId"), fn);
    },
    close: () => pool.end(),
  };
}
