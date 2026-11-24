-- Database roles (PLAN.md §3.1), part 2 of 2: the grants inside one database. Run it as the
-- provider's admin role while connected to the app's database, after 000_roles.sql. Database and
-- schema grants belong to one database, so a new database needs this file again. It works whatever
-- the database is called.
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO creatoros_migrator, app_user, auth_service',
                 current_database());
  -- CREATE: for the "app" and "drizzle" schemas the migrations add.
  EXECUTE format('GRANT CREATE ON DATABASE %I TO creatoros_migrator', current_database());
END
$$;

GRANT USAGE, CREATE ON SCHEMA public TO creatoros_migrator;
