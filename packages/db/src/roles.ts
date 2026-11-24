/**
 * Runs the files in sql/roles without psql, for the integration tests and any setup script.
 * 000_roles.sql uses psql's :'name' variables; each one is replaced by an escaped SQL literal, so
 * humans (psql) and code use the same files.
 */
import { readFileSync } from "node:fs";
import pg from "pg";

export interface RolePasswords {
  readonly migrator_password: string;
  readonly app_password: string;
  readonly auth_password: string;
}

/** The cluster-wide roles. Needs passwords: render it with renderRolesSql. */
export function loadRolesSql(): string {
  return readFileSync(new URL("../sql/roles/000_roles.sql", import.meta.url), "utf8");
}

/** The grants inside one database. Run it connected to that database. */
export function loadDatabaseGrantsSql(): string {
  return readFileSync(new URL("../sql/roles/010_database_grants.sql", import.meta.url), "utf8");
}

/** Replaces each :'name' with the escaped value. Missing or empty values throw. */
export function renderRolesSql(sql: string, values: RolePasswords): string {
  const known: Record<string, string> = { ...values };
  return sql.replace(/:'([a-z_]+)'/g, (_match, name: string) => {
    const value = known[name];
    if (value === undefined) throw new Error(`No value for psql variable "${name}".`);
    if (value === "") throw new Error(`The value for "${name}" is empty.`);
    return pg.escapeLiteral(value);
  });
}
