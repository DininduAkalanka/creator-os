CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_organization_id_user_id_unique" UNIQUE("organization_id","user_id"),
	CONSTRAINT "memberships_role_check" CHECK ("memberships"."role" IN ('OWNER', 'EDITOR', 'REVIEWER'))
);
--> statement-breakpoint
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"personal_owner_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_personal_owner_user_id_unique" UNIQUE("personal_owner_user_id"),
	CONSTRAINT "organizations_name_check" CHECK (char_length("organizations"."name") BETWEEN 1 AND 200)
);
--> statement-breakpoint
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_personal_owner_user_id_users_id_fk" FOREIGN KEY ("personal_owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_org_created_idx" ON "audit_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "memberships_org_created_idx" ON "memberships" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_key" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE POLICY "audit_logs_app_select" ON "audit_logs" AS PERMISSIVE FOR SELECT TO "app_user" USING ("audit_logs"."organization_id" = (SELECT app.current_org_id()));--> statement-breakpoint
CREATE POLICY "audit_logs_app_insert" ON "audit_logs" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("audit_logs"."organization_id" = (SELECT app.current_org_id()));--> statement-breakpoint
CREATE POLICY "audit_logs_bootstrap_insert" ON "audit_logs" AS PERMISSIVE FOR INSERT TO "tenant_bootstrap" WITH CHECK ("audit_logs"."user_id" = (SELECT app.current_user_id()) AND "audit_logs"."action" = 'organization.personal_created');--> statement-breakpoint
CREATE POLICY "memberships_app_select" ON "memberships" AS PERMISSIVE FOR SELECT TO "app_user" USING ("memberships"."organization_id" = (SELECT app.current_org_id()) OR "memberships"."user_id" = (SELECT app.current_user_id()));--> statement-breakpoint
CREATE POLICY "memberships_app_insert" ON "memberships" AS PERMISSIVE FOR INSERT TO "app_user" WITH CHECK ("memberships"."organization_id" = (SELECT app.current_org_id()));--> statement-breakpoint
CREATE POLICY "memberships_app_update" ON "memberships" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("memberships"."organization_id" = (SELECT app.current_org_id())) WITH CHECK ("memberships"."organization_id" = (SELECT app.current_org_id()));--> statement-breakpoint
CREATE POLICY "memberships_app_delete" ON "memberships" AS PERMISSIVE FOR DELETE TO "app_user" USING ("memberships"."organization_id" = (SELECT app.current_org_id()));--> statement-breakpoint
CREATE POLICY "memberships_bootstrap_insert" ON "memberships" AS PERMISSIVE FOR INSERT TO "tenant_bootstrap" WITH CHECK ("memberships"."user_id" = (SELECT app.current_user_id()) AND "memberships"."role" = 'OWNER' AND "memberships"."organization_id" IN (SELECT o.id FROM organizations o WHERE o.personal_owner_user_id = (SELECT app.current_user_id())));--> statement-breakpoint
CREATE POLICY "organizations_app_select" ON "organizations" AS PERMISSIVE FOR SELECT TO "app_user" USING ("organizations"."id" = (SELECT app.current_org_id()) OR "organizations"."id" IN (SELECT m.organization_id FROM memberships m WHERE m.user_id = (SELECT app.current_user_id())));--> statement-breakpoint
CREATE POLICY "organizations_app_update" ON "organizations" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("organizations"."id" = (SELECT app.current_org_id())) WITH CHECK ("organizations"."id" = (SELECT app.current_org_id()));--> statement-breakpoint
CREATE POLICY "organizations_bootstrap_select" ON "organizations" AS PERMISSIVE FOR SELECT TO "tenant_bootstrap" USING ("organizations"."personal_owner_user_id" = (SELECT app.current_user_id()));--> statement-breakpoint
CREATE POLICY "organizations_bootstrap_insert" ON "organizations" AS PERMISSIVE FOR INSERT TO "tenant_bootstrap" WITH CHECK ("organizations"."personal_owner_user_id" = (SELECT app.current_user_id()));--> statement-breakpoint
CREATE POLICY "users_app_select" ON "users" AS PERMISSIVE FOR SELECT TO "app_user" USING ("users"."id" = (SELECT app.current_user_id()) OR "users"."id" IN (SELECT m.user_id FROM memberships m WHERE m.organization_id = (SELECT app.current_org_id())));--> statement-breakpoint
CREATE POLICY "users_app_update_self" ON "users" AS PERMISSIVE FOR UPDATE TO "app_user" USING ("users"."id" = (SELECT app.current_user_id())) WITH CHECK ("users"."id" = (SELECT app.current_user_id()));--> statement-breakpoint
CREATE POLICY "users_auth_all" ON "users" AS PERMISSIVE FOR ALL TO "auth_service" USING (true) WITH CHECK (true);