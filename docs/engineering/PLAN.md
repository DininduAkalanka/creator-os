# CreatorOS — Engineering Plan (milestone M0)

**Status:** Approved for M1 by the founder on 24 November 2026; M1 and M2 are built (see "As built in M1" and "As built in M2" in section 2). M3 and M4 need their own approval before code.
**Written:** 20 November 2026, on branch `docs/m0-engineering-plan`.
**Covers:** Step 1 — Foundation, milestones M1 to M7 in [prompts/01_KICKOFF_foundation.md](../../prompts/01_KICKOFF_foundation.md).
**Rule:** this plan follows the [Decision Log](../00_Decision_Log.md) (ADR-001 to 025). Where it recommends a change, the change is listed as a proposal (P-01, P-02, …) in [PROGRESS.md](./PROGRESS.md). Nothing here edits an accepted ADR.

---

## 0. Orient

- **Goal of Step 1:** a user signs up, gets an organization, and automated tests prove they cannot read another organization's rows. Staging deploys on every merge (staging waits for M7 and accounts).
- **Goal of this document:** remove guesswork from M1–M7: folder layout, import rules, versions, the exact tenancy SQL, the sign-up bootstrap, IDs, tests, CI and the local setup.
- **Out of scope:** product features (upload, transcripts, cuts, exports, YouTube), billing, creating cloud resources.

---

## 1. Repository layout and import rules

```
creator-os/
  apps/
    web/            Next.js App Router: the app UI (the marketing site moves to apps/www later)
    api/            NestJS REST API under /api/v1
    worker/         Node worker process (media, ai, youtube queues); same packages as the API, deployed separately
  packages/
    contracts/      zod schemas, state enums + transition maps, error codes, response envelope, ID schema, OpenAPI helpers
    db/             Drizzle schema, SQL migrations, role bootstrap SQL, withOrgTx()/withUserTx(), deterministic seed
    ai/             AiGateway, SttGateway, versioned prompt files, provider adapters, cost tables   (empty until Step 2)
    media/          FFmpeg helpers, EDL model, exporters                                            (empty until Step 2)
    api-client/     typed client generated from the API's OpenAPI document (M5)
    ui/             shared React components (shadcn/ui based)
    config/         tsconfig, ESLint, Prettier, Vitest and dependency-cruiser presets (no runtime code)
  tools/
    concierge/      Track A scripts (prompts/02); become pipeline v0
  docker-compose.yml   Postgres + pgvector, local S3 (M3)
  docs/  prompts/  AGENTS.md  CLAUDE.md
```

Dockerfiles live next to the app they build (`apps/api/Dockerfile`, `apps/worker/Dockerfile`, M7). Role bootstrap SQL lives in `packages/db/sql/roles/` (section 3.1).

### Allowed imports

| Package | Purpose | May import (internal) |
| --- | --- | --- |
| `packages/contracts` | The single source of enums, schemas, errors and IDs | **Nothing internal** (external: `zod`, `uuid`, `@asteasolutions/zod-to-openapi`) |
| `packages/config` | Shared tool presets | Nothing (dev-only) |
| `packages/db` | Schema, migrations, tenancy helpers | `contracts` |
| `packages/ai` | Model and speech-to-text gateways | `contracts` |
| `packages/media` | FFmpeg, EDL, exporters | `contracts` |
| `packages/api-client` | Generated typed client | `contracts` (types only) |
| `packages/ui` | React components | `contracts` (types only) |
| `apps/web` | Browser UI | `contracts`, `api-client`, `ui`. **Never** `db`, `ai` or `media`: they hold server code and secrets |
| `apps/api` | HTTP API | `contracts`, `db`; `ai` and `media` only for pure functions (cost estimates, EDL validation) — *proposed, AGENTS.md doesn't say* |
| `apps/worker` | Background jobs | `contracts`, `db`, `ai`, `media` |
| `tools/concierge` | Validation scripts | `contracts`, `ai`, `media` once they exist; nothing imports `tools/` |

Rules from AGENTS.md §3: apps never import other apps; packages never import apps; `contracts` imports nothing internal. Added here: no deep imports (only each package's `exports` entry points), and packages never import `tools/`.

**Enforcement:** a dependency-cruiser rule set in `packages/config`, run in CI as `pnpm lint:deps` (proposal P-10). pnpm's strict `node_modules` also blocks importing a package that a `package.json` doesn't declare.

---

## 2. Tools and versions

**How checked:** `npm view <pkg> version` against registry.npmjs.org on **20 November 2026**. pnpm is not installed on this machine and M0 forbids installs; npm reads the same registry, so the numbers match `pnpm view`. Re-check each one with `pnpm view` when it is added (AGENTS.md §5).

### Runtime and toolchain

| Tool | Version | Pin | Notes |
| --- | --- | --- | --- |
| Node.js | **26.x** (Active LTS since late October 2026) | `.nvmrc` = `26.13.1`; `engines.node` = `>=26.13.1 <27` | This machine runs 26.13.1. Confirm the newest 26.x patch on nodejs.org in M1 |
| pnpm | 12.21.0 | `"packageManager": "pnpm@12.21.0"` (Corepack) | |
| Turborepo | 2.11.13 | | |
| TypeScript | **6.0.3 — not 7.0.2** | exact | `latest` is 7.0.2, but typescript-eslint 8.73.0 requires `typescript >=4.8.4 <6.1.0` and `@thallesp/nestjs-better-auth` 2.8.0 requires `^5.9.2 \|\| ^6.0.0`. Revisit when both support 7.x (P-02) |
| PostgreSQL | **18** + pgvector | | ADR-006 says 16+. 18 adds native `uuidv7()`; Neon has it GA and as the default (P-08). Docker image tag checked in M3 |
| Redis | **Not used** (ADR-021) | | |

### Libraries, by the milestone that adds them

| Milestone | Package | Version | Notes |
| --- | --- | --- | --- |
| M1 | `turbo` | 2.11.13 | |
| M1 | `typescript` | 6.0.3 | see above |
| M1 | `eslint` | 10.15.0 | flat config only |
| M1 | `typescript-eslint` | 8.73.0 | peer: eslint ^8.57 \|\| ^9 \|\| ^10 |
| M1 | `prettier` | 3.10.1 | |
| M1 | `vitest`, `@vitest/coverage-v8` | 5.1.1 | |
| M1 | `dependency-cruiser` | 18.8.0 | import rules |
| M1 | `next`, `eslint-config-next` | 16.4.6 | engines: node >=20.9 |
| M1 | `react`, `react-dom` | 19.3.1 | |
| M1 | `@tanstack/react-query` | 5.108.1 | |
| M1 | `tailwindcss` | 4.3.5 | |
| M1 | `shadcn` (CLI) | 4.23.0 | |
| M1 | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | 12.5.1 | engines: node >=20 |
| M1 | `@nestjs/cli` | 12.0.15 | |
| M2 | `zod` | 4.6.7 | |
| M2 | `@asteasolutions/zod-to-openapi` | 9.1.0 | peer: zod ^4 |
| M3 | `drizzle-orm` | 0.45.4 | 1.0 is at `rc.5`; stay on 0.45.x until 1.0 is GA |
| M3 | `drizzle-kit` | 0.31.11 | |
| M3 | `pg`, `@types/pg` | 8.23.1 | |
| M3 | `uuid` | 14.0.3 | `v7()` (section 5) |
| M3 | `testcontainers`, `@testcontainers/postgresql` | 12.2.2 | |
| M4 | `better-auth` | 1.7.27 | if chosen in M4; peers include `drizzle-orm ^0.45.2`, `next ^16`, `pg ^8` |
| M4 | `@thallesp/nestjs-better-auth` | 2.8.0 | community-maintained, linked from Better Auth's NestJS docs; peers: better-auth >=1.5 <2, Nest ^11.1.6 \|\| ^12, express ^5.1 |
| M5 | `nestjs-pino` / `pino` | 5.3.2 / 10.4.0 | |
| M5 | `@opentelemetry/sdk-node` | 0.301.2 | |
| M5 | `@opentelemetry/auto-instrumentations-node` | 0.83.1 | |
| M5 | `@sentry/nestjs`, `@sentry/nextjs` | 11.15.0 | DSN optional |
| M5 | `@nestjs/throttler` | 6.8.0 | |
| M5 | `@hey-api/openapi-ts` | 0.99.0 | generates `packages/api-client` |
| M6 | `pg-boss` / `graphile-worker` | 12.38.2 / 0.18.0 | ADR-021: one PostgreSQL job queue, chosen in M6; BullMQ 6.7.8's PostgreSQL support is the third candidate. node >=22.12 / >=22.18 |
| Later | `@playwright/test` | 1.65.1 | E2E from M4 |
| Later | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | 3.1173.0 | Step 2 uploads |
| Later | `ai` (Vercel AI SDK) / `@anthropic-ai/sdk` | 7.0.177 / 1.11.0 | Step 2 AiGateway (ADR-010) |
| Later | `mediabunny` | 1.66.2 | Track A C6 audio-extraction spike |
| Later | `@polar-sh/sdk`, `@polar-sh/better-auth` | 1.3.1, 2.1.5 | T5.1 billing, if P-05 is accepted |

**New majors:** NestJS 12, Vitest 5, ESLint 10, TypeScript 6, Zod 4, Tailwind 4, Next 16 and React 19.3 may be newer than a coding agent's training data. Read each package's migration guide or README before writing its config, and keep PRs small.

### As built in M1 (24 November 2026)

Re-checked with `pnpm view` when installed. Differences from the table above:

- **NestJS 12.6.0** (12.5.1 above). NestJS 12 is ESM-only, so the API is an ESM project on NodeNext.
- **typescript-eslint 8.73.0**, as above: 8.74.0 was out but published within pnpm's one-day minimum release age, and the guard was kept rather than exempted. Both still require TypeScript below 6.1 (P-02 holds).
- **ESLint 9.39.5** everywhere, not 10: `eslint-config-next`'s plugins don't support 10 yet (PROGRESS.md, known issues).
- **dependency-cruiser 18.9.0** (18.8.0 above).
- **No `@nestjs/cli`:** builds use `tsc`, and `pnpm dev` uses `packages/config/bin/dev-node.mjs` (tsc --watch + node --watch).
- `@tanstack/react-query`, `tailwindcss` and `shadcn` were not added yet: nothing in M1 uses them (the app shell is M7).
- Workspace packages export `"@creatoros/source"` (source, read only by the import rules), `"types"` and `"default"` (both from `dist/`).

### As built in M2 (24 November 2026)

What `packages/contracts` holds and why: [CONTRACTS.md](./CONTRACTS.md). Differences from the table above:

- **`uuid` 14.0.3 arrived in M2**, not M3, because the ID schema in contracts also generates IDs (`newId()`, section 5).
- **`@vitest/coverage-v8` 5.1.1 arrived in M2**, in `packages/contracts`, the first package that measures coverage. Its `pnpm test` fails below 95%.
- **`@asteasolutions/zod-to-openapi` 9.1.0 is used without `extendZodWithOpenApi`.** Component names come from zod's `.meta({ id })`, so importing contracts never patches zod's prototype (the web app imports contracts too).
- `zod` 4.6.7 and `@asteasolutions/zod-to-openapi` 9.1.0 as in the table. All four packages were re-checked with `pnpm view`, were older than pnpm's one-day release age, and `pnpm audit --prod` found no known vulnerabilities.

---

## 3. Database roles, migration 001 and `withOrgTx`

### 3.1 Roles

| Role | Login | Owns | Used by | Can do |
| --- | --- | --- | --- | --- |
| `creatoros_migrator` | yes | all schema objects | `drizzle-kit migrate` in CI/deploy and tests' setup | DDL. `NOBYPASSRLS`, so FORCE RLS applies to it too |
| `app_user` | yes | nothing | the API and worker connection pools | DML on tenant tables, always through RLS. Not the owner, `NOBYPASSRLS` |
| `auth_service` | yes | nothing | the auth module only (M4) | identity tables (`users` now; sessions/accounts/verifications in M4). No grants on tenant tables |
| `tenant_bootstrap` | **no** | `app.bootstrap_personal_org()` only | the SECURITY DEFINER function | insert exactly one personal organization for the user in context (section 4) |

The provider's admin role (for example Neon's `neondb_owner`) bypasses RLS. It never goes into an app connection string.

Roles are cluster-level and need passwords, so they are **not** a Drizzle migration. A human runs this once per environment with passwords from the secret store:

```sql
-- packages/db/sql/roles/000_roles.sql
-- Run once per environment as the provider's admin role, e.g.
--   psql "$ADMIN_URL" -v migrator_password=... -v app_password=... -v auth_password=... -f 000_roles.sql
CREATE ROLE creatoros_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD :'migrator_password';
CREATE ROLE app_user           LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT PASSWORD :'app_password';
CREATE ROLE auth_service       LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT PASSWORD :'auth_password';
CREATE ROLE tenant_bootstrap   NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT tenant_bootstrap TO creatoros_migrator;   -- lets the migrator hand the bootstrap function to tenant_bootstrap
GRANT CONNECT ON DATABASE creatoros TO creatoros_migrator, app_user, auth_service;
GRANT CREATE  ON DATABASE creatoros TO creatoros_migrator;   -- to create schema "app"
GRANT USAGE, CREATE ON SCHEMA public TO creatoros_migrator;
```

### 3.2 Migration 001 (run as `creatoros_migrator`)

Tables from prompts/01 M3: `users`, `organizations`, `memberships` (OWNER / EDITOR / REVIEWER) and `audit_logs`. `audit_logs` uses Doc 22 §63's columns. `users` uses the provider-neutral core identity fields (id, name, email, email_verified, image) so the M4 auth choice doesn't force a rewrite.

```sql
-- 001_tenancy.sql

CREATE SCHEMA app;
GRANT USAGE ON SCHEMA app    TO app_user, auth_service, tenant_bootstrap;
GRANT USAGE ON SCHEMA public TO app_user, auth_service, tenant_bootstrap;

-- Request context. NULLIF matters: once a custom setting has been used on a pooled
-- connection, current_setting(..., true) returns '' (not NULL) after the transaction ends,
-- and ''::uuid would raise an error instead of returning "no context".
CREATE FUNCTION app.current_org_id() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT NULLIF(current_setting('app.current_org_id', true), '')::uuid $$;

CREATE FUNCTION app.current_user_id() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid $$;

-- Identity (not a tenant table: a user can belong to several organizations)
CREATE TABLE users (
  id             uuid PRIMARY KEY,
  name           text,
  email          text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  image          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

-- Tenant root
CREATE TABLE organizations (
  id                     uuid PRIMARY KEY,
  name                   text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  personal_owner_user_id uuid UNIQUE REFERENCES users (id),   -- set only for the personal organization
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations (id),
  user_id         uuid NOT NULL REFERENCES users (id),
  role            text NOT NULL CHECK (role IN ('OWNER', 'EDITOR', 'REVIEWER')),  -- must equal the contracts enum
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX memberships_org_created_idx ON memberships (organization_id, created_at);
CREATE INDEX memberships_user_idx        ON memberships (user_id);

CREATE TABLE audit_logs (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations (id),
  user_id         uuid REFERENCES users (id),            -- NULL for system actions
  action          text NOT NULL,
  entity_type     text NOT NULL,
  entity_id       uuid,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_reference    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_org_created_idx ON audit_logs (organization_id, created_at);

-- RLS: ENABLE and FORCE in the same migration that creates the table (AGENTS.md §4.1)
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;  ALTER TABLE users         FORCE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;  ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships   ENABLE ROW LEVEL SECURITY;  ALTER TABLE memberships   FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;  ALTER TABLE audit_logs    FORCE ROW LEVEL SECURITY;

-- Policies. "(SELECT app.fn())" is evaluated once per statement, not once per row.

-- users
CREATE POLICY users_app_select ON users FOR SELECT TO app_user
  USING (id = (SELECT app.current_user_id())
         OR id IN (SELECT m.user_id FROM memberships m
                   WHERE m.organization_id = (SELECT app.current_org_id())));
CREATE POLICY users_app_update_self ON users FOR UPDATE TO app_user
  USING (id = (SELECT app.current_user_id()))
  WITH CHECK (id = (SELECT app.current_user_id()));
CREATE POLICY users_auth_all ON users FOR ALL TO auth_service
  USING (true) WITH CHECK (true);

-- organizations
CREATE POLICY organizations_app_select ON organizations FOR SELECT TO app_user
  USING (id = (SELECT app.current_org_id())
         OR id IN (SELECT m.organization_id FROM memberships m
                   WHERE m.user_id = (SELECT app.current_user_id())));
CREATE POLICY organizations_app_update ON organizations FOR UPDATE TO app_user
  USING (id = (SELECT app.current_org_id()))
  WITH CHECK (id = (SELECT app.current_org_id()));
CREATE POLICY organizations_bootstrap_select ON organizations FOR SELECT TO tenant_bootstrap
  USING (personal_owner_user_id = (SELECT app.current_user_id()));
CREATE POLICY organizations_bootstrap_insert ON organizations FOR INSERT TO tenant_bootstrap
  WITH CHECK (personal_owner_user_id = (SELECT app.current_user_id()));

-- memberships (a user may also read their own memberships in other organizations: GET /me needs it)
CREATE POLICY memberships_app_select ON memberships FOR SELECT TO app_user
  USING (organization_id = (SELECT app.current_org_id())
         OR user_id = (SELECT app.current_user_id()));
CREATE POLICY memberships_app_insert ON memberships FOR INSERT TO app_user
  WITH CHECK (organization_id = (SELECT app.current_org_id()));
CREATE POLICY memberships_app_update ON memberships FOR UPDATE TO app_user
  USING (organization_id = (SELECT app.current_org_id()))
  WITH CHECK (organization_id = (SELECT app.current_org_id()));
CREATE POLICY memberships_app_delete ON memberships FOR DELETE TO app_user
  USING (organization_id = (SELECT app.current_org_id()));
CREATE POLICY memberships_bootstrap_insert ON memberships FOR INSERT TO tenant_bootstrap
  WITH CHECK (user_id = (SELECT app.current_user_id())
              AND role = 'OWNER'
              AND organization_id IN (SELECT o.id FROM organizations o
                                      WHERE o.personal_owner_user_id = (SELECT app.current_user_id())));

-- audit_logs (append-only: no UPDATE or DELETE grant to anyone but the owner)
CREATE POLICY audit_logs_app_select ON audit_logs FOR SELECT TO app_user
  USING (organization_id = (SELECT app.current_org_id()));
CREATE POLICY audit_logs_app_insert ON audit_logs FOR INSERT TO app_user
  WITH CHECK (organization_id = (SELECT app.current_org_id()));
CREATE POLICY audit_logs_bootstrap_insert ON audit_logs FOR INSERT TO tenant_bootstrap
  WITH CHECK (user_id = (SELECT app.current_user_id())
              AND action = 'organization.personal_created');

-- Grants (RLS filters rows; grants decide which statements are allowed at all)
GRANT SELECT, UPDATE (name, image, updated_at)  ON users         TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE            ON users         TO auth_service;
GRANT SELECT, UPDATE (name, updated_at)         ON organizations TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE            ON memberships   TO app_user;
GRANT SELECT, INSERT                            ON audit_logs    TO app_user;
GRANT SELECT (id, personal_owner_user_id), INSERT ON organizations TO tenant_bootstrap;
GRANT INSERT ON memberships, audit_logs TO tenant_bootstrap;
-- app_user gets no INSERT/DELETE on organizations: organizations are created only by the bootstrap
-- function in M3/M4 (team organizations and deletion are later decisions).

-- Sign-up bootstrap (section 4)
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
ALTER  FUNCTION app.bootstrap_personal_org(uuid, uuid, uuid, text) OWNER TO tenant_bootstrap;
REVOKE ALL     ON FUNCTION app.bootstrap_personal_org(uuid, uuid, uuid, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION app.bootstrap_personal_org(uuid, uuid, uuid, text) TO app_user, auth_service;
```

**Notes for M3:**

- **Drizzle:** declare the tables and policies in the TypeScript schema (`pgPolicy`, `.enableRLS()`) so drift detection matches, but write 001 as a reviewed custom SQL migration (`drizzle-kit generate --custom`): FORCE RLS, the `app` schema, the functions and the grants are not generated by Drizzle. Check that the next `drizzle-kit generate` does not try to drop them.
- **Facts the design relies on (PostgreSQL docs):** superusers and `BYPASSRLS` roles always skip RLS; `FORCE` makes RLS apply to the table owner; with RLS on and no matching policy, access is denied; foreign-key checks are not filtered by RLS; `INSERT … RETURNING` must also pass the SELECT policy.
- **Roles vs. permissions:** RLS stops cross-tenant access. Who may do what *inside* an organization (only OWNER invites, REVIEWER can't edit) is checked by the API guard, not by these policies.
- **The CHECK on `role`** must equal the contracts enum. A test in M3 compares them.

### 3.3 `withOrgTx(orgId, fn)` and `withUserTx(userId, fn)`

Design sketch for `packages/db` (not final code):

```ts
export async function withOrgTx<T>(
  ctx: { orgId: string; userId?: string },
  fn: (tx: AppTx) => Promise<T>,
): Promise<T> {
  const orgId = OrgIdSchema.parse(ctx.orgId);                  // UUID check before anything reaches SQL
  const userId = ctx.userId ? UserIdSchema.parse(ctx.userId) : '';
  return appDb.transaction(async (tx) => {
    await tx.execute(sql`
      select set_config('app.current_org_id',  ${orgId},  true),
             set_config('app.current_user_id', ${userId}, true)`);
    return fn(tx);
  });
}
// withUserTx(userId, fn): same, with only app.current_user_id set (GET /me, the bootstrap call).
```

- **`set_config(name, value, true)` is `SET LOCAL`.** It has the same transaction scope, but it accepts bind parameters; `SET LOCAL` does not, and building that string by hand would be an injection risk.
- **Transaction-scoped settings work with transaction-mode poolers** (PgBouncer, Neon's pooler). Session-level `SET` is never used.
- `packages/db` exports `withOrgTx` and `withUserTx` to apps. It does not export a raw tenant-capable client. Migrations and seed use the migrator pool; the auth module uses an `auth_service` pool limited to identity tables.
- **API:** the guard resolves session → user → membership → org → role, then the handler runs inside `withOrgTx`.
- **Worker:** every job payload carries `orgId`; the handler wraps its database work in `withOrgTx(job.orgId)`.
- **Never hold a transaction open across slow work.** Read in one transaction, call FFmpeg or a model outside it, and write the results in a second `withOrgTx`.
- **Isolation level:** READ COMMITTED by default. Idempotency keys and the job queue may need row locks or SERIALIZABLE; this is decided in M6.

---

## 4. Sign-up bootstrap: creating the first organization

At sign-up the user exists but no organization does, so there is no org context for RLS. Two options:

| | A. Narrow SECURITY DEFINER function (recommended) | B. Separate privileged path |
| --- | --- | --- |
| How | `app.bootstrap_personal_org()` (above), owned by the NOLOGIN role `tenant_bootstrap`, whose RLS policies allow only "insert a personal org + OWNER membership + one audit row for the user in context" | A second connection pool with a privileged role (owner or `BYPASSRLS`), used only by the sign-up handler |
| Blast radius of a bug | One function, one row shape, one user | Any code that can reach the privileged pool can read or write every tenant |
| Credentials | None extra: callers use `app_user` / `auth_service` | A privileged password inside the API process |
| Idempotency | Built in (`ON CONFLICT`, unique `personal_owner_user_id`), safe under concurrent first sign-ins | Must be written in TypeScript |
| Testing | Plain SQL tests with Testcontainers | Needs tests that the privileged pool is used nowhere else |
| Risks | `search_path` hijacking (fixed with `SET search_path = ''`); it trusts `app.current_user_id`, which only server code sets after verifying the session | Privilege creep over time |

**Recommendation: A.**

**Flow (provider-neutral):**

1. The auth module creates the `users` row as `auth_service`.
2. On the first authenticated request, or from the auth provider's after-create hook, the API runs `withUserTx(userId, tx => tx.execute(app.bootstrap_personal_org(...)))` with three new UUIDs and a default name.
3. The function returns the org ID. Calling it on every sign-in is safe, so a failed first call self-heals.

The default organization name is UI copy, decided in M4.

---

## 5. UUID v7

**Recommendation: generate IDs in the application** with `uuid` 14's `v7()`, exposed through the ID schema in `packages/contracts`. Columns are `uuid`, with no database default in 001.

Why:

- IDs are known before the insert, which the bootstrap function, idempotency keys, job payloads and storage keys all need.
- It works on any PostgreSQL ≥ 16 (ADR-006) and in every test container, whatever the provider supports.
- One implementation serves the API, the worker and the browser.

When PostgreSQL 18 runs in every environment (P-08), add `DEFAULT uuidv7()` as a safety net in a later migration.

**Caveat:** a v7 ID reveals its creation time to the millisecond. Never use an ID as a secret; share links get separate random tokens.

---

## 6. Test strategy

| Layer | Tool | Runs | Where |
| --- | --- | --- | --- |
| Unit | Vitest | every PR | `contracts` (≥ 95% coverage, M2), pure functions |
| Integration | Vitest + **Testcontainers** (PostgreSQL 18 + pgvector) | every PR (`pnpm test:int`) | `packages/db`, API modules, worker |
| Contract | Vitest + generated OpenAPI | every PR (M5) | envelope and error shapes |
| E2E | Playwright | nightly and before release (M4+) | sign-up → org → `/me` |

**Tenancy (M3; one helper call per new tenant table):**

1. **Role facts:** `app_user` owns no table and has `rolsuper = false` and `rolbypassrls = false` (from `pg_roles` and `pg_class`).
2. **RLS meta-test:** every table with an `organization_id` column, plus `organizations` and `users`, has `relrowsecurity` and `relforcerowsecurity` set and at least one policy. A new tenant table without RLS fails CI automatically.
3. **Cross-tenant matrix**, for each tenant table, as `app_user` inside `withOrgTx(A)`:
   - SELECT on B's rows returns 0 rows;
   - UPDATE and DELETE on B's rows affect 0 rows;
   - INSERT with `organization_id = B` fails with SQLSTATE 42501.
4. **No context:** SELECT returns 0 rows on every tenant table, and INSERT fails.
5. **Context leakage:** on the same pooled connection, run `withOrgTx(A)`, then a query with no context. It sees 0 rows, which proves the transaction scope and the `NULLIF('')` handling.
6. **Bootstrap:**
   - two calls return the same org;
   - 10 concurrent calls create 1 org and 1 membership;
   - a call with no user context fails with 42501;
   - `app_user` cannot INSERT into `organizations` directly.
7. **Migrations repeat:** migrate an empty database twice (drop and recreate in between) and compare `pg_dump --schema-only` output.
8. **Enum parity:** each DB CHECK list equals its contracts enum.

**Idempotency-Key (M6):**

- Replaying the same key with the same body returns the stored status and body, and the handler ran once.
- The same key with a different body returns a conflict error from the catalog.
- Concurrent requests with the same key execute once.
- Keys are scoped per organization (RLS on `idempotency_keys`).
- Keys expire.

**Job queue (M6, ADR-021):**

- A rolled-back transaction leaves no job.
- A committed job runs even if the worker was down when it was enqueued (there is no relay to crash between commit and enqueue).
- A duplicate delivery runs side effects once (the job ID is the idempotency key).
- Retries back off, and after max attempts the job lands in the DLQ.
- The handler runs inside `withOrgTx`, and a cross-tenant read in a handler returns 0 rows.

**Speed:** one Postgres container per test run. Each test file gets a fresh database cloned from a migrated template database (`CREATE DATABASE … TEMPLATE …`).

**Fixtures:** recorded fixtures only for third-party APIs; never live creator channels (AGENTS.md §5).

---

## 7. CI plan (GitHub Actions, M1)

`.github/workflows/ci.yml` runs on `pull_request` and `push` to `main`, with `permissions: contents: read` and `concurrency` set to cancel superseded runs.

| Job | Steps |
| --- | --- |
| `quality` | checkout → Node from `.nvmrc` → `corepack enable` → `pnpm install --frozen-lockfile` → `pnpm turbo run lint typecheck test build` → `pnpm lint:deps` |
| `integration` (from M3) | same setup → `pnpm test:int` (Docker is available on GitHub's Ubuntu runners for Testcontainers) |
| `secrets` | checkout with full history → **gitleaks CLI** (pinned release). The gitleaks GitHub Action needs a license key for repositories owned by a GitHub *organization*; the CLI does not |
| `dependencies` | `pnpm audit --prod --audit-level=high`. Dependabot (or Renovate) for weekly npm and GitHub Actions updates |
| `e2e` (from M4) | nightly schedule + before release; Playwright with traces as artifacts |

- Pin third-party actions to commit SHAs.
- Cache the pnpm store; Turborepo remote caching is optional, later.
- Branch protection on `main` requires `quality`, `integration` and `secrets`. Staging deploy-on-merge is added in M7.

---

## 8. Windows and WSL2 notes

**Observed on this machine (20 Nov 2026):**

- Windows 11, Node 26.13.1, npm 11.20.0, Docker 29.9.3 (Docker Desktop on WSL2).
- WSL has only Docker Desktop's internal `docker-desktop` distro; no Ubuntu.
- pnpm and FFmpeg are not installed.
- No git identity is configured.
- The repo sits under `OneDrive\Desktop`.

**Recommendations, before M1:**

1. **Move the working copy out of OneDrive.** OneDrive syncs every file under `node_modules` (pnpm creates many links), which slows installs and can lock files mid-install. Best: clone into a WSL2 Ubuntu filesystem (`~/code/creator-os`). Acceptable: `C:\dev\creator-os`, outside OneDrive.
2. **Install an Ubuntu WSL2 distro** and turn on Docker Desktop's WSL integration for it. Run pnpm, tests and Testcontainers inside WSL. Testcontainers also works from Windows with Docker Desktop, but file watching and paths are simpler in WSL.
3. **Node:** nvm or fnm inside WSL, reading `.nvmrc`. **pnpm:** `corepack enable`, which uses the version pinned in `packageManager`.
4. **FFmpeg** isn't needed until Step 2 and Track A. In WSL, `sudo apt install ffmpeg`. The worker image installs its own (M7). Code reads the binary path from config; never hard-code a Windows path.
5. **Line endings:** `.gitattributes` already forces LF. Keep `core.autocrlf=false` in WSL.
6. **Playwright** (M4+): `pnpm exec playwright install --with-deps` inside WSL.
7. **Git identity:** set your own `user.name` and `user.email` before M1. The M0 commit reused the identity from earlier commits through one-off `-c` flags; no config was changed.
8. **Ports:** check that 5432 (Postgres) and the local S3 port are free.

---

## 9. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| ~~Market focus conflict between the founder and the docs~~ **Resolved by ADR-020** (worldwide focus, US East region, English-first STT, one USD price) | — | Docs, prompts and AGENTS.md updated on branch `docs/adr-020-worldwide-focus` |
| TypeScript 7 (`latest`) breaks typescript-eslint and the NestJS Better Auth adapter | Red CI from day one | Pin 6.0.3 (P-02) |
| New majors are newer than agent training data | Wrong config, invented APIs | Read migration guides; small PRs; never guess (AGENTS.md §5) |
| MinIO's community edition is archived and its official Docker image is no longer published (AGENTS.md §5 says "MinIO locally") | `docker compose up` fails in M3 | **ADR-022:** a maintained S3-compatible image, chosen in M3; test only S3 API behaviour |
| RLS mistakes: a missing policy, the `''` cast, an owner or provider-admin bypass | Cross-tenant leak (P0) | Roles in section 3.1; tests 1–5 in section 6 |
| Drizzle 1.0 is still RC; custom SQL can drift from the TS schema | Surprise drops or diffs on the next `generate` | Stay on 0.45.x; review every generated SQL file (AGENTS.md §5) |
| The bootstrap function trusts `app.current_user_id` | A code bug could create an empty personal org for another user (no data exposure) | Only the session guard sets the user context; tests |
| Better Auth's own tables vs. ours (users, and the organization plugin) | Rework in M4 | **ADR-023:** our own `organizations` and `memberships`; Better Auth's user table maps onto `users` (details in the M4 plan) |
| ADR-008's outbox + relay is the most complex part of Step 1 | M6 runs long | **ADR-021:** a Postgres-native queue makes enqueue transactional, with no relay |
| Managed Postgres version and region | `uuidv7()` and latency | Neon has PG18 GA and US regions; ADR-020 picks US East |
| Local `main` is stale and `origin/main` wasn't fetched (no network beyond the registry without approval) | This branch is based on `docs/prompt-kit-and-cleanup`, not on `main` | Q9 |
| Windows + OneDrive friction | Slow, flaky installs | Section 8 |

---

## 10. Open questions and proposals

The open questions (Q1–Q11) and the ADR proposals (P-01–P-11) are in [PROGRESS.md](./PROGRESS.md), so they are tracked in one place.

---

## Sources (checked 20 November 2026)

- npm registry, via `npm view` (versions in section 2)
- [Node.js — Evolving the release schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule), [Node.js 26 status (secondary)](https://endoflife.ai/nodejs/26)
- [Neon — Postgres 18](https://neon.com/blog/postgres-18), [Neon — Regions](https://neon.com/docs/introduction/regions), [Neon — RLS with Drizzle (owner role bypasses RLS)](https://neon.com/docs/guides/rls-drizzle)
- [Drizzle — Row-Level Security](https://orm.drizzle.team/docs/rls)
- [PostgreSQL — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Better Auth — NestJS integration](https://better-auth.com/docs/integrations/nestjs)
- [MinIO community edition status (secondary)](https://glukhov.org/data-infrastructure/object-storage/minio-dead/), [MinIO image changes](https://www.minimus.io/post/minio-docker-image-changes-how-to-find-a-secure-minio-alternative), [Alternatives](https://pinggy.io/blog/minio_archived_self_hosted_s3_alternatives/)
- [Encore — BullMQ alternatives (transactional enqueue)](https://encore.dev/articles/bullmq-alternatives)
- [Lemon Squeezy — 2026 update](https://www.lemonsqueezy.com/blog/2026-update), [Polar — Fees](https://polar.sh/docs/merchant-of-record/fees), [Polar — Supported countries](https://polar.sh/docs/merchant-of-record/supported-countries)
