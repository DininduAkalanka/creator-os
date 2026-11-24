import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { describe, expect, it } from "vitest";
import { MIGRATIONS_FOLDER } from "./migrate.js";
import * as schema from "./schema.js";

// drizzle-kit's API declarations reference zod v3 types that aren't installed here, so their
// parameter types resolve to errors. This is the real signature: two snapshots in, SQL out.
const diff = generateMigration as (previous: unknown, current: unknown) => Promise<string[]>;

describe("schema drift", () => {
  it("src/schema.ts matches the last migration snapshot: no migration is missing", async () => {
    const meta = join(MIGRATIONS_FOLDER, "meta");
    const snapshots = readdirSync(meta)
      .filter((file) => file.endsWith("_snapshot.json"))
      .sort();
    const last = snapshots.at(-1);
    expect(last, "no migration snapshot found").toBeDefined();
    const previous: unknown = JSON.parse(readFileSync(join(meta, String(last)), "utf8"));
    const statements = await diff(previous, generateDrizzleJson(schema));
    expect(statements).toEqual([]);
  });
});
