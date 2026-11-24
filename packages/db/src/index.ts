/**
 * @creatoros/db: the Drizzle schema, the reviewed SQL migrations with row-level security, and
 * withOrgTx/withUserTx (PLAN.md §3). Apps reach tenant tables only through createTenantDatabase;
 * there is no raw client export. Migrations and the seed run from the package's CLI, not from
 * apps. Imports only contracts (AGENTS.md §3).
 */
export * from "./schema.js";
export {
  createTenantDatabase,
  type OrgContext,
  type TenantDatabase,
  type TenantDatabaseOptions,
  type TenantTx,
} from "./tenancy.js";
