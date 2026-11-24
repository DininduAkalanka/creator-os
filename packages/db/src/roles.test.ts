import pg from "pg";
import { describe, expect, it } from "vitest";
import {
  loadDatabaseGrantsSql,
  loadRolesSql,
  renderRolesSql,
  type RolePasswords,
} from "./roles.js";

const passwords: RolePasswords = {
  migrator_password: "m-1",
  app_password: "a-2",
  auth_password: "s-3",
};

describe("renderRolesSql", () => {
  it("fills in every psql variable of 000_roles.sql", () => {
    const sql = renderRolesSql(loadRolesSql(), passwords);
    expect(sql).toContain("CREATE ROLE creatoros_migrator LOGIN");
    expect(sql).toContain("PASSWORD 'm-1'");
    expect(sql).toContain("PASSWORD 'a-2'");
    expect(sql).toContain("PASSWORD 's-3'");
    expect(sql).not.toMatch(/:'[a-z_]+'/);
  });

  it("escapes quotes and backslashes, so a password can't end the literal", () => {
    const hostile = "x'; DROP ROLE y; --\\";
    const sql = renderRolesSql("PASSWORD :'app_password';", {
      ...passwords,
      app_password: hostile,
    });
    expect(sql).toBe(`PASSWORD ${pg.escapeLiteral(hostile)};`);
    expect(sql).toContain("x''; DROP ROLE y; --\\\\'"); // the quote doubled, the backslash doubled
    expect(sql).toContain("E'"); // a backslash makes it an escape string literal
  });

  it("leaves the per-database grants without variables, so they run as they are", () => {
    expect(loadDatabaseGrantsSql()).not.toMatch(/:'[a-z_]+'/);
    expect(loadDatabaseGrantsSql()).toContain("current_database()");
  });

  it("refuses a variable it has no value for", () => {
    expect(() => renderRolesSql("PASSWORD :'other_password'", passwords)).toThrow(
      'No value for psql variable "other_password".',
    );
  });

  it("refuses an empty password", () => {
    expect(() =>
      renderRolesSql("PASSWORD :'app_password'", { ...passwords, app_password: "" }),
    ).toThrow('The value for "app_password" is empty.');
  });
});
