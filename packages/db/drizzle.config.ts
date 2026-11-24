import { defineConfig } from "drizzle-kit";

// drizzle-kit only generates migrations from src/schema.ts. There are no database credentials here
// on purpose: migrations are applied by `pnpm db:migrate` (src/migrate.ts), and `push`/`pull` are
// never used, because they would try to drop the hand-written parts (see src/schema.ts).
// Hand-written migrations: `pnpm exec drizzle-kit generate --custom --name <name>`.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
});
