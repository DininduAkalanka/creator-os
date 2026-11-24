/**
 * Integration tests (PLAN.md §6): one PostgreSQL 18 container for the whole run. The roles come
 * from sql/roles/000_roles.sql, run with random passwords, and the database "creatoros" is migrated
 * once and used as a template: each test file gets its own clone (test/db.ts).
 */
import { randomBytes } from "node:crypto";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import pg from "pg";
import type { TestProject } from "vitest/node";
import { runMigrations } from "../src/migrate.js";
import {
  loadDatabaseGrantsSql,
  loadRolesSql,
  renderRolesSql,
  type RolePasswords,
} from "../src/roles.js";

/** The image compose.yaml runs locally: PostgreSQL 18.7 with pgvector 0.8.7, pinned by digest. */
export const POSTGRES_IMAGE =
  "pgvector/pgvector:0.8.7-pg18-trixie@sha256:ab49524d18df7200b74ac9a475e1db6297fc1eb57da4c214c63d10ecc4b754fa";

export interface PgInfo {
  readonly host: string;
  readonly port: number;
  readonly containerId: string;
  readonly adminUser: string;
  readonly adminPassword: string;
  readonly passwords: RolePasswords;
}

declare module "vitest" {
  export interface ProvidedContext {
    pg: PgInfo;
  }
}

/** Random, plus a quote and a backslash, which the roles helper must escape. */
function password(): string {
  return `${randomBytes(18).toString("base64url")}'\\`;
}

let container: StartedPostgreSqlContainer | undefined;

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  container = await new PostgreSqlContainer(POSTGRES_IMAGE).withDatabase("creatoros").start();
  const passwords: RolePasswords = {
    migrator_password: password(),
    app_password: password(),
    auth_password: password(),
  };
  const admin = new pg.Client({ connectionString: container.getConnectionUri() });
  await admin.connect();
  try {
    await admin.query(renderRolesSql(loadRolesSql(), passwords));
    await admin.query(loadDatabaseGrantsSql()); // connected to "creatoros"
  } finally {
    await admin.end();
  }

  const info: PgInfo = {
    host: container.getHost(),
    port: container.getPort(),
    containerId: container.getId(),
    adminUser: container.getUsername(),
    adminPassword: container.getPassword(),
    passwords,
  };
  await runMigrations(connectionUrl(info, "migrator", "creatoros"));
  project.provide("pg", info);

  return async () => {
    await container?.stop();
  };
}

export type Role = "admin" | "migrator" | "app" | "auth";

export function connectionUrl(info: PgInfo, role: Role, database: string): string {
  const credentials = {
    admin: [info.adminUser, info.adminPassword],
    migrator: ["creatoros_migrator", info.passwords.migrator_password],
    app: ["app_user", info.passwords.app_password],
    auth: ["auth_service", info.passwords.auth_password],
  } as const;
  const [user, secret] = credentials[role];
  const url = new URL(`postgres://${info.host}:${info.port}/${database}`);
  url.username = user;
  url.password = secret;
  return url.toString();
}
