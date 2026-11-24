/**
 * `pnpm db:migrate` and `pnpm db:seed` run this file (built). The connection URLs come from
 * packages/db/.env.local (see .env.example); they are never printed.
 */
import { runMigrations } from "./migrate.js";
import { seed } from "./seed.js";

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "")
    throw new Error(`${name} is not set (see .env.example).`);
  return value;
}

async function main(command: string | undefined): Promise<void> {
  if (command === "migrate") {
    await runMigrations(required("MIGRATOR_DATABASE_URL"));
    console.info("Migrations applied.");
  } else if (command === "seed") {
    await seed({ authUrl: required("AUTH_DATABASE_URL"), appUrl: required("DATABASE_URL") });
    console.info("Seed data in place: 2 users, 2 organizations, 3 memberships.");
  } else {
    throw new Error("Usage: node dist/cli.js migrate|seed");
  }
}

try {
  await main(process.argv[2]);
} catch (error) {
  // The message only: a stack trace adds nothing for a CLI, and no URL is ever part of it.
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
