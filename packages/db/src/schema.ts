/**
 * The tenancy tables of migration 001 (PLAN.md §3.2). Typed queries and drizzle-kit's drift check
 * use this file; the migration SQL is reviewed by hand (AGENTS.md §5).
 *
 * Drizzle does not manage the `app` schema, its context functions, FORCE ROW LEVEL SECURITY, the
 * grants or the bootstrap function: they live in the migration's hand-written part. Never run
 * `drizzle-kit push`: it would compare against the live database and try to drop them.
 */
import { ROLES } from "@creatoros/contracts";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgPolicy,
  pgRole,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** The database roles (PLAN.md §3.1). Created per environment by sql/roles/000_roles.sql. */
export const appUser = pgRole("app_user").existing();
export const authService = pgRole("auth_service").existing();
export const tenantBootstrap = pgRole("tenant_bootstrap").existing();

const currentOrgId = sql`(SELECT app.current_org_id())`;
const currentUserId = sql`(SELECT app.current_user_id())`;

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ROLES are fixed upper-case literals from contracts, so they can be written into the CHECK as is.
if (!ROLES.every((role) => /^[A-Z_]+$/.test(role))) throw new Error("ROLES must be UPPER_SNAKE.");
const roleList = sql.raw(ROLES.map((role) => `'${role}'`).join(", "));

/** Identity. Not a tenant table: a user can belong to several organizations. */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("users_email_lower_key").on(sql`lower(${t.email})`),
    pgPolicy("users_app_select", {
      for: "select",
      to: appUser,
      using: sql`${t.id} = ${currentUserId} OR ${t.id} IN (SELECT m.user_id FROM memberships m WHERE m.organization_id = ${currentOrgId})`,
    }),
    pgPolicy("users_app_update_self", {
      for: "update",
      to: appUser,
      using: sql`${t.id} = ${currentUserId}`,
      withCheck: sql`${t.id} = ${currentUserId}`,
    }),
    pgPolicy("users_auth_all", {
      for: "all",
      to: authService,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

/** The tenant root. A personal organization has `personalOwnerUserId` set. */
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    personalOwnerUserId: uuid("personal_owner_user_id")
      .unique()
      .references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("organizations_name_check", sql`char_length(${t.name}) BETWEEN 1 AND 200`),
    pgPolicy("organizations_app_select", {
      for: "select",
      to: appUser,
      using: sql`${t.id} = ${currentOrgId} OR ${t.id} IN (SELECT m.organization_id FROM memberships m WHERE m.user_id = ${currentUserId})`,
    }),
    pgPolicy("organizations_app_update", {
      for: "update",
      to: appUser,
      using: sql`${t.id} = ${currentOrgId}`,
      withCheck: sql`${t.id} = ${currentOrgId}`,
    }),
    pgPolicy("organizations_bootstrap_select", {
      for: "select",
      to: tenantBootstrap,
      using: sql`${t.personalOwnerUserId} = ${currentUserId}`,
    }),
    pgPolicy("organizations_bootstrap_insert", {
      for: "insert",
      to: tenantBootstrap,
      withCheck: sql`${t.personalOwnerUserId} = ${currentUserId}`,
    }),
  ],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role", { enum: ROLES }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("memberships_organization_id_user_id_unique").on(t.organizationId, t.userId),
    index("memberships_org_created_idx").on(t.organizationId, t.createdAt),
    index("memberships_user_idx").on(t.userId),
    check("memberships_role_check", sql`${t.role} IN (${roleList})`),
    // A user may also read their own memberships in other organizations: GET /me needs it.
    pgPolicy("memberships_app_select", {
      for: "select",
      to: appUser,
      using: sql`${t.organizationId} = ${currentOrgId} OR ${t.userId} = ${currentUserId}`,
    }),
    pgPolicy("memberships_app_insert", {
      for: "insert",
      to: appUser,
      withCheck: sql`${t.organizationId} = ${currentOrgId}`,
    }),
    pgPolicy("memberships_app_update", {
      for: "update",
      to: appUser,
      using: sql`${t.organizationId} = ${currentOrgId}`,
      withCheck: sql`${t.organizationId} = ${currentOrgId}`,
    }),
    pgPolicy("memberships_app_delete", {
      for: "delete",
      to: appUser,
      using: sql`${t.organizationId} = ${currentOrgId}`,
    }),
    pgPolicy("memberships_bootstrap_insert", {
      for: "insert",
      to: tenantBootstrap,
      withCheck: sql`${t.userId} = ${currentUserId} AND ${t.role} = 'OWNER' AND ${t.organizationId} IN (SELECT o.id FROM organizations o WHERE o.personal_owner_user_id = ${currentUserId})`,
    }),
  ],
);

/** Append-only: nobody but the owner may UPDATE or DELETE (Doc 22 §63). */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata")
      .notNull()
      .default(sql`'{}'::jsonb`),
    ipReference: text("ip_reference"),
    createdAt: createdAt(),
  },
  (t) => [
    index("audit_logs_org_created_idx").on(t.organizationId, t.createdAt),
    pgPolicy("audit_logs_app_select", {
      for: "select",
      to: appUser,
      using: sql`${t.organizationId} = ${currentOrgId}`,
    }),
    pgPolicy("audit_logs_app_insert", {
      for: "insert",
      to: appUser,
      withCheck: sql`${t.organizationId} = ${currentOrgId}`,
    }),
    pgPolicy("audit_logs_bootstrap_insert", {
      for: "insert",
      to: tenantBootstrap,
      withCheck: sql`${t.userId} = ${currentUserId} AND ${t.action} = 'organization.personal_created'`,
    }),
  ],
);
