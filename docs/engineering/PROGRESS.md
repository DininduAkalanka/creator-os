# Engineering progress

The coding agent updates this file at the end of every session (AGENTS.md §7, step 7). Newest entries go first.

## Current milestone

M0 — Engineering plan: **written, waiting for approval** ([PLAN.md](./PLAN.md)). M1 starts only after approval.

## Done

| Date | Milestone / task | Commit | How it was verified |
| --- | --- | --- | --- |
| 2026-11-20 | ADR-020 worldwide market focus: Decision Log, AGENTS.md, prompts 02/03, docs index, banners on Docs 01/04/05/26 and the Implementation Plan, unit-economics model (one global price) | branch `docs/adr-020-worldwide-focus` | `python docs/models/unit_economics.py` prints ARPU $33.00, contribution $24.38 (74%), break-even 16 / 123 customers, matching ADR-020; grep shows no South Asia instructions left in AGENTS.md or the prompts |
| 2026-11-20 | M0 — `docs/engineering/PLAN.md` (layout, versions, migration 001 SQL, bootstrap, UUID v7, tests, CI, Windows notes) | branch `docs/m0-engineering-plan` | Docs only. Versions checked with `npm view` on 2026-11-20 (pnpm not installed; same registry). SQL reviewed by reading; not executed (no database in M0) |

## Next

1. Human review of PLAN.md, answers to Q1–Q11, and a yes/no on each proposal below.
2. M1 — Monorepo scaffold (after approval, ideally after the repo moves out of OneDrive, Q10).

## Open questions for the human

1. **Market focus — answered.** Worldwide (mainly the USA, Canada, the UK and Europe, Australia and the UAE), recorded as ADR-020 on 20 Nov 2026.
2. **Auth provider for M4** (unchanged): Better Auth (recommended: self-hosted, data in our Postgres, no per-user fee) or Clerk? If Better Auth: map its user table onto our `users`, and keep organizations and memberships as our own RLS tables instead of the Better Auth organization plugin (recommended), or use the plugin?
3. **How does a request name its organization?** A header such as `X-Organization-Id` checked against the membership (recommended, default = personal org), a path segment, or an "active organization" stored in the session? The docs don't say.
4. **Queue (decide before M6):** keep ADR-008 (Redis + BullMQ + transactional outbox), or accept P-04 (a Postgres-native queue)?
5. **Local S3 for M3:** MinIO's community image is no longer published. Which replacement (P-03)?
6. **Hosting accounts for M7:** which providers should I plan for (for example Vercel + Railway/Render/Fly.io + Neon)? I need you to create the accounts and secrets; I won't create cloud resources.
7. **Selling entity (not needed until T5.1):** is the company registered in Sri Lanka? This decides the merchant of record (P-05), or whether a US entity with Stripe is an option.
8. **Product name** (unchanged): the website and brand wait for it; code uses `creatoros`.
9. **Git base:** local `main` is stale and I did not fetch (CLAUDE.md: ask before network beyond the package registry). This branch is based on `docs/prompt-kit-and-cleanup` (76ba005), which you say was merged as PR #2. May I `git fetch` and rebase onto `origin/main` before you open the PR?
10. **Dev machine:** may I plan M1 assuming the repo moves to a WSL2 Ubuntu filesystem (or `C:\dev`, outside OneDrive), with pnpm through `corepack enable`? Both need your action or approval to install.
11. **Implementation Plan copy:** the live plan you pasted is newer than `docs/Implementation_Plan.md` (status lines: decision log "merged to main", "make the repo private", first action ticked). Should the repo copy be updated?

## Proposed decisions (to become ADRs once approved)

| # | Proposal | Supersedes / touches | Why |
| --- | --- | --- | --- |
| P-01 | **Accepted on 20 Nov 2026 as ADR-020** (worldwide market focus) | ADR-013, ADR-016, ADR-018, Doc 26, Implementation Plan, AGENTS.md | Founder decision |
| P-02 | Pin **TypeScript 6.0.x** (6.0.3), not 7.0.x, until typescript-eslint and the NestJS Better Auth adapter support 7 | AGENTS.md §5 (versions) | typescript-eslint 8.73 peer `<6.1.0`; `@thallesp/nestjs-better-auth` peer `^5.9.2 \|\| ^6.0.0` |
| P-03 | **Replace MinIO for local S3** with a maintained S3-compatible image (candidates: SeaweedFS, Garage, RustFS, or Chainguard's free MinIO image). Tests target S3 API behaviour only (presigned PUT, multipart, CORS) | AGENTS.md §5, Implementation Plan Step 1.3 | MinIO stopped publishing community images (Oct 2025); repository archived (Apr 2026) |
| P-04 | **Postgres-native job queue** (pg-boss or Graphile Worker; first check whether BullMQ 6 can use its optional `pg` peer). Enqueue in the same transaction as the state change and the `usage_ledger` row; no outbox relay; no Redis in the MVP | ADR-006 (Redis), ADR-008 (outbox) | Transactional enqueue for free, one less managed service, M6 much smaller. Job volume is tiny (long media/AI jobs), well within Postgres-queue throughput |
| P-05 | **Merchant of record:** Polar first (lists Sri Lanka payouts; Starter 5% + 50¢, +1.5% non-US cards; usage meters and credits for extra hours; Better Auth plugin), Paddle as backup. Remove Lemon Squeezy from consideration | ADR-012 (provider list) | Lemon Squeezy closed to new sellers on 16 Nov 2026. Fees stay within ADR-012's 7% + $0.50 model |
| P-06 | **Database role layout:** `creatoros_migrator` (owner), `app_user` (RLS), `auth_service` (identity tables only), `tenant_bootstrap` (NOLOGIN, owns the bootstrap function) | ADR-002 detail | Least privilege; no privileged pool in the API (PLAN.md §3–4) |
| P-07 | **UUID v7 generated in the app** (`uuid` v7); DB default `uuidv7()` added later only when PG18 runs everywhere | AGENTS.md §5 detail | IDs needed before insert; portable (PLAN.md §5) |
| P-08 | **PostgreSQL 18** as the target version (ADR-006 says 16+) | ADR-006 detail | Native `uuidv7()`; GA on Neon |
| P-09 | **Drizzle 0.45.x** until 1.0 is GA; FORCE RLS, functions and grants in reviewed custom SQL migrations | ADR-007 detail | 1.0 is still RC; Drizzle doesn't generate FORCE RLS |
| P-10 | **Import boundaries enforced by dependency-cruiser** in CI | AGENTS.md §3 enforcement | Rules are only real if CI checks them |
| P-11 | **Re-check plan hours before pre-sales** (product decision, not engineering) | ADR-014 | Gling sells 10 h for $20/month ($10 billed annually); the Creator plan offers 5 h for $19. At realistic use (3/8/25 h), 10/30/100 h tiers still keep ~77–81% margin; at 100% use, high cost, the 100 h tier loses money, so cap or fair-use it |

## Known issues and tech debt

- No application code yet (expected).
- pnpm and FFmpeg are not installed; no WSL Ubuntu distro; no git identity configured (PLAN.md §8).
- The repo lives under OneDrive (PLAN.md §8).
- Local `main` is stale; this branch is based on `docs/prompt-kit-and-cleanup` (Q9).
