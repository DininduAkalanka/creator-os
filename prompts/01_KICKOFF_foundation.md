# Prompt 01 — Kickoff: Step 0 (engineering) + Step 1 (Foundation)

**How to use:** open your coding agent at the repo root. Paste everything between the two lines below. The agent works one milestone per session. After each report, review it, then start a fresh session with: *"Continue with the next milestone in prompts/01_KICKOFF_foundation.md. Read AGENTS.md and docs/engineering/PROGRESS.md first."*

---

You are the founding engineering team of CreatorOS (internal code name). You work as one agent that switches between roles: **Staff Engineer** (plan and architecture), **Backend**, **Frontend**, **QA**, **Security**, **SRE** and **AI/ML Engineer**. You build production-grade, multi-tenant SaaS from day one, but you build **only what the current milestone needs**.

## Context to load (in this order, and only these)

1. `AGENTS.md`: read it fully and follow it. It defines the rules, the work loop (§7), the role checklists (§8) and the Definition of Done (§9).
2. `docs/engineering/PROGRESS.md`
3. `docs/00_Decision_Log.md`: read all of it.
4. `docs/26_Revised_SaaS_Foundation_and_Unit_Economics.md`: §1, §5, §6, §8.5 and §14 only.
5. `docs/Implementation_Plan.md`: only the sections "Key decisions", "Step-by-step implementation plan" (Step 0 and Step 1), "Data model v1" and "Engineering standards and quality gates".

The repo has documentation and no code yet.

## Goal of this series

Finish **Step 1 — Foundation**. The exit test, from the plan: *a user signs up, gets an organization, and automated tests prove they cannot read another organization's rows; staging deploys on every merge.* Staging needs accounts, so it can wait for M7.

## Milestones (one per session; stop and report after each)

**M0 — Engineering plan (no code).** Write `docs/engineering/PLAN.md` with:
- the final folder tree and each package's purpose and allowed imports;
- tool and library versions, checked with `pnpm view` (never from memory);
- the outline of migration 001, with exact RLS policies:
  - `app_user` versus the migration owner role;
  - `ENABLE` and `FORCE ROW LEVEL SECURITY`;
  - `current_setting('app.current_org_id', true)`;
- how sign-up creates the first organization before any org context exists. Choose one of: a narrow `SECURITY DEFINER` function, or a separate privileged bootstrap path. Explain the trade-off.
- the UUID v7 strategy: generate in the app, or use Postgres 18's `uuidv7()` if the target managed Postgres supports it;
- the test strategy for tenancy, idempotency and the outbox;
- risks and open questions.

Then stop. I approve the plan before M1.

**M1 — Monorepo scaffold.**
- **Workspace:** pnpm workspace with Turborepo, a strict TypeScript base config, ESLint, Prettier and Vitest presets in `packages/config`.
- **Apps:** `apps/web` (Next.js App Router), `apps/api` (NestJS), `apps/worker` (a Node process).
- **Packages:** `packages/contracts`, `packages/db`, `packages/ui` (empty shell).
- **Root scripts:** `dev`, `lint`, `typecheck`, `test`, `build`.
- **CI:** a GitHub Actions workflow that runs lint, typecheck, test and build, plus a gitleaks secret scan and a dependency audit.
- **Repo files:** `.env.example`, `.nvmrc`, `.gitignore` (media, transcripts and `.env*` ignored), and a README "Local development" section. Fill in AGENTS.md §6.

*Exit:* on a fresh clone, `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` are all green.

**M2 — Contracts.** In `packages/contracts`:
- every state enum in ADR-004, including media asset, edit decision and export job;
- transition maps and `assertTransition()`;
- the error-code catalog;
- envelope and error schemas;
- the cursor-pagination schema;
- the ID schema;
- the zod → OpenAPI helper.

*Exit:* unit tests cover every allowed transition and a sample of forbidden ones; contracts coverage is at least 95%.

**M3 — Database and tenancy.** (Plan approval needed before code.)
- `docker-compose.yml` with Postgres + pgvector, Redis and MinIO, all with healthchecks.
- `packages/db` with Drizzle.
- Migration 001: `users`, `organizations`, `memberships` (role OWNER / EDITOR / REVIEWER) and `audit_logs`, with the roles and RLS from PLAN.md.
- A `withOrgTx(orgId, fn)` helper and a deterministic seed script.

*Exit:* Testcontainers integration tests prove that:
1. as `app_user`, org A cannot select, insert, update or delete org B's rows;
2. a query with no org context returns no tenant rows;
3. migrations from an empty database are repeatable.

**M4 — Auth and personal organization.** **Stop before starting** and ask me to confirm the auth provider. My recommendation is Better Auth (self-hosted, data in our Postgres, no per-user fee); the alternative is Clerk. Then build:
- sign-up and sign-in with Google and email;
- an HttpOnly session cookie;
- an API guard that resolves user → membership → org → role;
- a personal organization created idempotently on first sign-in.

*Exit:* an end-to-end test shows sign-up → org created → `GET /api/v1/me` returns that org. A second user gets 404 on the first user's org resources, and RLS blocks the read even when the guard is bypassed in a test.

**M5 — API conventions and observability.** Global NestJS setup:
- request IDs;
- a zod validation pipe;
- an exception filter that returns the error envelope, and an envelope interceptor;
- rate limiting;
- CORS for the app domain;
- `/health` and `/ready` (checks DB and Redis);
- OpenAPI served at `/api/v1/openapi.json`, plus a typed client generated into `packages/api-client`;
- pino with redaction;
- OpenTelemetry tracing;
- Sentry, with an optional DSN.

*Exit:* contract tests for the success and error shapes, and `apps/web` uses the generated client for `/me`.

**M6 — Worker, outbox and idempotency.**
- An `outbox_events` table (with RLS) and an outbox relay in `apps/worker` that feeds BullMQ.
- An `idempotency_keys` table plus middleware for `Idempotency-Key`.
- A sample `noop.echo` job that proves:
  - the enqueue is transactional;
  - retries with backoff work;
  - failed jobs reach the DLQ;
  - duplicate deliveries are handled idempotently;
  - the org context is set inside the worker.

*Exit:* integration tests for a crash between commit and enqueue, duplicate delivery, and an Idempotency-Key replay.

**M7 — App shell and deploy config.**
- The web app shell: navigation for Contents, Review, Channel Audit and Settings, with empty states.
- Feature flags backed by env and DB, including `youtube_publish=false`.
- Dockerfiles for the API and worker, and deploy config for web.

**Stop and ask me** for accounts and secrets. Never create cloud resources yourself.

## Rules for this series

- Run the AGENTS.md work loop for every milestone. M0, M3 and M4 need my approval of the plan before any code.
- Don't build product features (upload, transcripts, cuts, YouTube) in this series.
- Never print, log or commit secrets. Ask me for any key you need.
- End every session with the report format in AGENTS.md §7, and update `docs/engineering/PROGRESS.md`.

## Start now

Do **M0 only**.

---
