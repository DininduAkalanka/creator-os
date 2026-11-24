-- Migration 001, part 3 of 3 (hand-written; PLAN.md §3.2). What Drizzle can't generate: FORCE
-- ROW LEVEL SECURITY, the grants and the sign-up bootstrap function. Run as creatoros_migrator.

-- FORCE makes RLS apply to the table owner too (AGENTS.md §4.1). Part 2 enabled RLS.
ALTER TABLE users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Grants: RLS filters rows; grants decide which statements are allowed at all.
GRANT SELECT, UPDATE (name, image, updated_at) ON users TO app_user;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO auth_service;
--> statement-breakpoint
-- app_user gets no INSERT or DELETE on organizations: only the bootstrap function creates them
-- (team organizations and deletion are later decisions).
GRANT SELECT, UPDATE (name, updated_at) ON organizations TO app_user;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON memberships TO app_user;
--> statement-breakpoint
-- audit_logs is append-only: no UPDATE or DELETE for anyone but the owner.
GRANT SELECT, INSERT ON audit_logs TO app_user;
--> statement-breakpoint
GRANT SELECT (id, personal_owner_user_id), INSERT ON organizations TO tenant_bootstrap;
--> statement-breakpoint
GRANT INSERT ON memberships, audit_logs TO tenant_bootstrap;
--> statement-breakpoint

-- Sign-up bootstrap (PLAN.md §4): creates the user's personal organization, the OWNER membership
-- and one audit row, exactly once, even under concurrent first sign-ins.
CREATE FUNCTION app.bootstrap_personal_org(
  p_org_id uuid, p_membership_id uuid, p_audit_id uuid, p_org_name text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''           -- no search_path hijacking: every name below is schema-qualified
AS $$
DECLARE
  v_user_id uuid := app.current_user_id();
  v_org_id  uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'bootstrap_personal_org: no user context' USING ERRCODE = '42501';
  END IF;

  SELECT o.id INTO v_org_id FROM public.organizations o WHERE o.personal_owner_user_id = v_user_id;
  IF v_org_id IS NOT NULL THEN
    RETURN v_org_id;                                  -- idempotent: later sign-ins return the same org
  END IF;

  INSERT INTO public.organizations (id, name, personal_owner_user_id)
  VALUES (p_org_id, p_org_name, v_user_id)
  ON CONFLICT (personal_owner_user_id) DO NOTHING
  RETURNING id INTO v_org_id;

  IF v_org_id IS NULL THEN                            -- a concurrent call won the race
    SELECT o.id INTO v_org_id FROM public.organizations o WHERE o.personal_owner_user_id = v_user_id;
    RETURN v_org_id;
  END IF;

  INSERT INTO public.memberships (id, organization_id, user_id, role)
  VALUES (p_membership_id, v_org_id, v_user_id, 'OWNER');

  INSERT INTO public.audit_logs (id, organization_id, user_id, action, entity_type, entity_id)
  VALUES (p_audit_id, v_org_id, v_user_id, 'organization.personal_created', 'organization', v_org_id);

  RETURN v_org_id;
END;
$$;
--> statement-breakpoint
-- Grants first, while the migrator still owns the function: after the hand-over, only
-- tenant_bootstrap could grant on it.
REVOKE ALL ON FUNCTION app.bootstrap_personal_org(uuid, uuid, uuid, text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app.bootstrap_personal_org(uuid, uuid, uuid, text) TO app_user, auth_service;
--> statement-breakpoint
-- PostgreSQL lets a function pass only to an owner with CREATE on its schema. tenant_bootstrap gets
-- CREATE on "app" just for the hand-over, and loses it straight after.
GRANT CREATE ON SCHEMA app TO tenant_bootstrap;
--> statement-breakpoint
ALTER FUNCTION app.bootstrap_personal_org(uuid, uuid, uuid, text) OWNER TO tenant_bootstrap;
--> statement-breakpoint
REVOKE CREATE ON SCHEMA app FROM tenant_bootstrap;
