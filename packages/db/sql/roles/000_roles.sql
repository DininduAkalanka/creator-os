-- Database roles (PLAN.md §3.1), part 1 of 2: the roles themselves. Roles belong to the whole
-- cluster and need passwords, so this is not a migration: run it once per environment as the
-- provider's admin role, with passwords from the secret store, then run 010_database_grants.sql
-- in the app's database:
--   psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -v migrator_password=... -v app_password=... \
--        -v auth_password=... -f 000_roles.sql -f 010_database_grants.sql
-- Locally, docker compose runs both on the first start (docker/postgres/initdb/010-roles.sh).
-- The integration tests run the same files with random passwords (src/roles.ts).

-- Owns the schema and runs the migrations. FORCE ROW LEVEL SECURITY applies to it too.
CREATE ROLE creatoros_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD :'migrator_password';
-- The API and worker pools: owns nothing, every row goes through RLS.
CREATE ROLE app_user           LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT PASSWORD :'app_password';
-- The auth module only (M4): identity tables, no tenant tables.
CREATE ROLE auth_service       LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT PASSWORD :'auth_password';
-- Owns app.bootstrap_personal_org() and nothing else; nobody can log in as it.
CREATE ROLE tenant_bootstrap   NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

-- Lets the migrator hand the bootstrap function to tenant_bootstrap. INHERIT FALSE (PostgreSQL 16+):
-- the migrator does not pick up tenant_bootstrap's insert policies (approved in the M3 plan).
GRANT tenant_bootstrap TO creatoros_migrator WITH INHERIT FALSE;
