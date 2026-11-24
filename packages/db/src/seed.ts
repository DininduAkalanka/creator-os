/**
 * Development seed (`pnpm db:seed`). Two users, each with a personal organization, and the second
 * user as an EDITOR in the first one's organization. Rows are written the way the app writes them,
 * because under FORCE ROW LEVEL SECURITY nobody else can: users as auth_service (sign-up, M4),
 * organizations through the bootstrap function, the extra membership inside withOrgTx. The IDs are
 * fixed, so running it again changes nothing. It refuses to run with NODE_ENV=production.
 */
import { sql } from "drizzle-orm";
import pg from "pg";
import { createTenantDatabase } from "./tenancy.js";

export const SEED = {
  ava: {
    userId: "0190a3c0-0000-7000-8000-000000000001",
    orgId: "0190a3c0-0000-7000-8000-000000000101",
    membershipId: "0190a3c0-0000-7000-8000-000000000201",
    auditId: "0190a3c0-0000-7000-8000-000000000301",
    name: "Ava Chen",
    email: "ava@example.com",
  },
  sara: {
    userId: "0190a3c0-0000-7000-8000-000000000002",
    orgId: "0190a3c0-0000-7000-8000-000000000102",
    membershipId: "0190a3c0-0000-7000-8000-000000000202",
    auditId: "0190a3c0-0000-7000-8000-000000000302",
    name: "سارة أحمد", // a right-to-left name (AGENTS.md §5)
    email: "sara@example.com",
  },
  /** Sara as an EDITOR in Ava's organization. */
  saraInAvasOrg: "0190a3c0-0000-7000-8000-000000000203",
} as const;

export interface SeedUrls {
  /** auth_service: writes users. */
  readonly authUrl: string;
  /** app_user: everything else, through RLS. */
  readonly appUrl: string;
}

export async function seed(urls: SeedUrls, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  if (env.NODE_ENV === "production") throw new Error("The seed is for development only.");

  const auth = new pg.Client({ connectionString: urls.authUrl });
  await auth.connect();
  try {
    for (const user of [SEED.ava, SEED.sara]) {
      await auth.query(
        "INSERT INTO users (id, name, email, email_verified) VALUES ($1, $2, $3, true) ON CONFLICT (id) DO NOTHING",
        [user.userId, user.name, user.email],
      );
    }
  } finally {
    await auth.end();
  }

  const app = createTenantDatabase(urls.appUrl, { maxConnections: 1 });
  try {
    for (const user of [SEED.ava, SEED.sara]) {
      await app.withUserTx(user.userId, (tx) =>
        tx.execute(
          sql`SELECT app.bootstrap_personal_org(${user.orgId}, ${user.membershipId}, ${user.auditId}, ${`${user.name}'s workspace`})`,
        ),
      );
    }
    await app.withOrgTx({ orgId: SEED.ava.orgId, userId: SEED.ava.userId }, (tx) =>
      tx.execute(
        sql`INSERT INTO memberships (id, organization_id, user_id, role)
            VALUES (${SEED.saraInAvasOrg}, ${SEED.ava.orgId}, ${SEED.sara.userId}, 'EDITOR')
            ON CONFLICT DO NOTHING`,
      ),
    );
  } finally {
    await app.close();
  }
}
