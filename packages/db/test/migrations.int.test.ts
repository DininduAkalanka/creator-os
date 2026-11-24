/**
 * M3 exit test 3 (prompts/01, PLAN.md §6 item 7): migrations from an empty database are repeatable.
 * Two empty databases migrated separately give the same schema, and running again changes nothing.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "../src/migrate.js";
import { adminQuery, createDatabase, schemaDump, type TestDatabase } from "./db.js";

let first: TestDatabase;
let second: TestDatabase;

beforeAll(async () => {
  [first, second] = await Promise.all([createDatabase("empty"), createDatabase("empty")]);
  await runMigrations(first.url("migrator"));
  await runMigrations(second.url("migrator"));
});

afterAll(async () => {
  await Promise.all([first.drop(), second.drop()]);
});

const applied = async (db: TestDatabase) =>
  (
    await adminQuery("SELECT hash FROM drizzle.__drizzle_migrations ORDER BY id", {
      database: db.name,
    })
  ).rows;

describe("exit test 3: migrations are repeatable", () => {
  it("give an identical schema in two empty databases", async () => {
    const [a, b] = await Promise.all([schemaDump(first.name), schemaDump(second.name)]);
    expect(a).toContain("CREATE TABLE public.memberships");
    expect(a).toContain("ALTER TABLE ONLY public.memberships FORCE ROW LEVEL SECURITY");
    expect(a).toBe(b);
  });

  it("change nothing when run again", async () => {
    const before = await schemaDump(first.name);
    const appliedBefore = await applied(first);
    await runMigrations(first.url("migrator"));
    expect(await applied(first)).toEqual(appliedBefore);
    expect(await schemaDump(first.name)).toBe(before);
    expect(appliedBefore).toHaveLength(3);
  });
});
