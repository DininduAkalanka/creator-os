/**
 * Applies the migrations in packages/db/drizzle as creatoros_migrator (PLAN.md §3.1). Migrations
 * already applied are skipped, so running it again is a no-op. Never run it as app_user, which
 * owns nothing, or as the provider's admin role, which bypasses RLS.
 */
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

/** src/ and dist/ both sit next to drizzle/. */
export const MIGRATIONS_FOLDER = fileURLToPath(new URL("../drizzle", import.meta.url));

export async function runMigrations(migratorUrl: string): Promise<void> {
  const pool = new pg.Pool({ connectionString: migratorUrl, max: 1 });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
}
