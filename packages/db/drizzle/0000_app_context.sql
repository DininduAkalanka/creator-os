-- Migration 001, part 1 of 3 (hand-written; PLAN.md §3.2). The request context that the RLS
-- policies in part 2 read. Run as creatoros_migrator.
CREATE SCHEMA app;
--> statement-breakpoint
GRANT USAGE ON SCHEMA app TO app_user, auth_service, tenant_bootstrap;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO app_user, auth_service, tenant_bootstrap;
--> statement-breakpoint
-- NULLIF matters: once a custom setting has been used on a pooled connection,
-- current_setting(..., true) returns '' (not NULL) after the transaction ends, and ''::uuid would
-- raise an error instead of meaning "no context".
CREATE FUNCTION app.current_org_id() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT NULLIF(current_setting('app.current_org_id', true), '')::uuid $$;
--> statement-breakpoint
CREATE FUNCTION app.current_user_id() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid $$;
