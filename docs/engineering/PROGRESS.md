# Engineering progress

The coding agent updates this file at the end of every session (AGENTS.md §7, step 7). Newest entries go first.

## Current milestone

- **Pre-launch website (W1, part 1): built as a preview** on branch `feat/website-scaffold` (local worktree `C:\dev\creator-os`, not pushed). It can't launch yet: the preview notice lists the blockers.
- M0 — Engineering plan: **written, waiting for approval** ([PLAN.md](./PLAN.md)). Product milestones (M1 onwards) start only after approval. The workspace scaffold below covers only what the website needs.

## Done

| Date | Milestone / task | Commit | How it was verified |
| --- | --- | --- | --- |
| 2026-11-22 | Website v3: photo- and video-led redesign after a deeper adobe.com study (Premiere product page, aem.live loading rules). 10 AI-generated photos and 3 AI-generated videos supplied by the founder, all labelled on the page; media pipeline (`pnpm --filter @creatoros/www media`, sharp); `BackgroundVideo` (loads after the page, pauses off screen, pause button, off for reduced motion); creator-voice copy; story section, stacked feature blocks, photo persona cards, creator-worry FAQ | branch `feat/website-scaffold` | 41 unit + 39 end-to-end tests pass (axe: 0 violations; new tests for the pause button, lazy video loading, reduced motion, AI labels). Lighthouse mobile 89-91 (median 91), desktop 99, accessibility 100, best practices 100. Screenshots reviewed on desktop and phone |
| 2026-11-21 | Website v2 redesign ("editing suite at night"): research of adobe.com, grammarly.com, canva.com; new design system (semantic tokens, dark + paper themes, self-hosted Bricolage Grotesque / Instrument Sans / Martian Mono); interactive cut demo in the hero; bento features; ticket-style founding pass; mobile menu; security headers (CSP etc.); Playwright end-to-end + axe tests and a CI job; [design doc](../design/website-design.md) | branch `feat/website-scaffold` | 41 unit tests; 31 end-to-end tests pass on desktop and phone (axe: 0 WCAG 2.2 AA violations on every page). Lighthouse (local, mobile, 3 runs): performance 90–96, accessibility 100, best practices 100; desktop performance 100. SEO 63 only because previews are `noindex` by design. Screenshots reviewed at 1440 px and on a Pixel 7 profile |
| 2026-11-21 | Website in Docker: `apps/www/Dockerfile` (multi-stage, Next.js standalone server, non-root), root `compose.yaml` (`www` service in the `site` profile; read-only filesystem, no capabilities), `.dockerignore`, `pnpm docker:*` scripts, CI job that builds the image | branch `feat/website-scaffold` | Image built locally (413 MB). Container healthy. Every route 200 (unknown 404), robots.txt closed, form posted without JavaScript: errors shown, valid input gets "not open yet". Runs as uid 1000 (`node`); no errors in the logs. Local `pnpm build` unchanged (no standalone output outside Docker) |
| 2026-11-20 | CI workflow (format, lint, typecheck, test, build; gitleaks secret scan; `pnpm audit`), Dependabot, AGENTS.md §6 commands, README "Local development" | branch `feat/website-scaffold` | Full local gate passes; `pnpm audit --prod --audit-level high`: no known vulnerabilities. Workflow not run on GitHub yet (not pushed) |
| 2026-11-20 | Website pages: home (hero, problem, how it works, features, audiences, founding offer, data handling, FAQ, waitlist), draft privacy policy and terms, about, 404, robots.txt, sitemap, icon, social image | `c60ded3` | `next build`: all 9 routes static. Served with `next start` and checked with curl: every route 200 (unknown route 404), `noindex` meta and `Disallow: /` while `SITE_INDEXABLE` is unset. Form posted without JavaScript: invalid input shows the field errors and keeps the values; valid input gets the "not open yet" message. Screenshots: desktop dark and light themes, and a real 390 px phone width with no horizontal scroll |
| 2026-11-20 | Waitlist rules: optional role, channel (URL or @handle), videos per month, editing hours, language; error codes; "waitlist storage" launch blocker | `32a56f2` | 28 unit tests pass (Vitest) |
| 2026-11-20 | Workspace scaffold: pnpm 12 + Turborepo, shared tsconfig, `apps/www` (Next.js 16.4, React 19.3, Tailwind 4.3, TS 6.0.3), site and offer config, launch-blocker logic | `4e58b50` | lint, typecheck, test and build pass |
| 2026-11-20 | ADR-020 worldwide market focus: Decision Log, AGENTS.md, prompts 02/03, docs index, banners on Docs 01/04/05/26 and the Implementation Plan, unit-economics model (one global price) | branch `docs/adr-020-worldwide-focus` | `python docs/models/unit_economics.py` prints ARPU $33.00, contribution $24.38 (74%), break-even 16 / 123 customers, matching ADR-020; grep shows no South Asia instructions left in AGENTS.md or the prompts |
| 2026-11-20 | M0 — `docs/engineering/PLAN.md` (layout, versions, migration 001 SQL, bootstrap, UUID v7, tests, CI, Windows notes) | branch `docs/m0-engineering-plan` | Docs only. Versions checked with `npm view` on 2026-11-20 (pnpm not installed; same registry). SQL reviewed by reading; not executed (no database in M0) |

## Next

1. Human review of the website branch (run `pnpm dev` in `C:\dev\creator-os`), PLAN.md, the open questions and the proposals below.
2. **W1, part 2: waitlist storage** (needs approval: it adds a database table). Proposed: a `waitlist_signups` table (email, optional answers, consent text version and time, confirmation token hash, confirmed time, unsubscribed time), double opt-in by email, rate limiting and a honeypot field. Needs a database account (for example Neon) and an email account (for example Resend) that you create. When it lands, set `FEATURES.waitlistStorage` to true in the same change.
3. Fill in the launch blockers: product name and domain, company details, lawyer review (Q12), then a real demo video from your own footage to replace the illustration.
4. M1 onwards, after PLAN.md is approved.

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
10. **Dev machine — answered.** Code lives locally in `C:\dev\creator-os`, never in OneDrive (approved 20 Nov 2026). pnpm is installed globally with npm.
11. **Implementation Plan copy:** the live plan you pasted is newer than `docs/Implementation_Plan.md` (status lines: decision log "merged to main", "make the repo private", first action ticked). Should the repo copy be updated?
12. **For the lawyer reviewing the privacy policy and terms** (drafts at `/privacy` and `/terms`): the retention period after the waitlist closes; how long hosting logs are kept; the minimum age (the draft says 16); the governing law; whether an EU and a UK representative are needed (GDPR Art. 27); the email footer for CAN-SPAM and CASL (postal address, unsubscribe); and the list of service providers, once chosen.
13. **Website claims to confirm:** the site describes these as planned, from accepted ADRs: audio-only upload where possible and deletion of uploaded originals after 7 days (ADR-015), optional read-only YouTube access (ADR-009), Creator plan $19 for 5 h with a 12-month price lock for 50 founding creators (ADR-014, `src/config/offer.ts`; see P-11), month-to-month plans you can cancel at any time, and no multi-camera support at first. Tell me if any of these should change.

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

- No product code yet (expected); only the website exists.
- The waitlist form stores nothing yet (by design until part 2 above). The site must not launch before then; the preview notice enforces this.
- GitHub Actions are pinned to major versions (`@v5`, `@v4`, `@v2`), not commit SHAs, because checking the latest SHAs needs network access beyond the package registry. Dependabot will update them; pin SHAs once the repo is on GitHub.
- The gitleaks action is free for personal GitHub accounts; a GitHub organization needs a `GITLEAKS_LICENSE` secret.
- pnpm 12 is installed globally with npm (Node 26 no longer bundles corepack). FFmpeg is not installed; no WSL Ubuntu distro (PLAN.md §8).
- Code lives in the local worktree `C:\dev\creator-os` (outside OneDrive). The original clone under OneDrive is still there for the docs branches.
- Local `main` is stale; the branches are based on `docs/prompt-kit-and-cleanup` (Q9).
