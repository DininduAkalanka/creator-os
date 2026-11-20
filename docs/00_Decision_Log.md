# CreatorOS — Decision Log

**Last updated:** 20 November 2026
**Rule:** this log wins over every other document. If a document disagrees with an accepted decision here, the document is out of date. Change a decision only by adding a new entry that supersedes the old one, never by editing history.

**Status values:** Accepted · Superseded · Proposed

The background for ADR-001 to ADR-013 is in the CTO Review & Implementation Plan. The background for ADR-014 to ADR-019 is in [Document 26 — Revised SaaS Foundation & Unit Economics](./26_Revised_SaaS_Foundation_and_Unit_Economics.md).

---

## Summary table

| ADR | Title | Status |
| --- | --- | --- |
| 001 | MVP scope | **Accepted (revised 20 Nov 2026)** |
| 002 | Tenancy and roles | **Accepted (revised 20 Nov 2026)** |
| 003 | Domain language | Accepted |
| 004 | Canonical states | Accepted (extended 20 Nov 2026) |
| 005 | API conventions | Accepted |
| 006 | Stack | Accepted |
| 007 | ORM | Accepted |
| 008 | Workflow execution | Accepted |
| 009 | Auth and YouTube grant | Accepted |
| 010 | AI gateway | Accepted |
| 011 | No Python service in MVP | Accepted |
| 012 | Billing | Accepted (extended 20 Nov 2026) |
| 013 | Hosting | Accepted |
| 014 | Price and meter by footage hours | Accepted |
| 015 | Audio-first media, NLE hand-off | Accepted |
| 016 | Speech-to-text language router | Accepted |
| 017 | Do-not-build list | Accepted |
| 018 | Regional pricing | Accepted |
| 019 | Build order: copilot before Channel Audit | Accepted |

---

## ADR-001 — MVP scope (revised)

**Decision:** the paid core is an **AI first-pass editor and review workspace** for talking-head and screen-recording YouTube videos:

- inputs: raw footage;
- outputs: a rough cut (EDL), captions, chapters, titles and description, and thumbnail ideas;
- review: in the browser;
- hand-off: export to Premiere Pro, DaVinci Resolve or Final Cut Pro.

A free, read-only **Channel Audit** is the acquisition tool. YouTube publishing is Phase 2, after Google's audit passes. Generated video (script → AI voice → stock footage) is Phase 3 and opt-in only.

**Why:**

- Editing time is the strongest pain in Doc 02.
- The paid core needs no YouTube login, so it avoids the 100-user cap on unverified apps and the private-lock on unaudited uploads.
- YouTube now gives free A/B testing and an analytics assistant (Ask Studio), so analytics alone is a weak paid product.

**Supersedes:** the earlier ADR-001 ("Channel Intelligence + Production Copilot, Channel Intelligence first"), Doc 05's analytics-first MVP, and Doc 19's generated-video MVP.

## ADR-002 — Tenancy and roles (revised)

**Decision:**

- `organizations` + `memberships`, with `organization_id NOT NULL` on every tenant table.
- PostgreSQL row-level security from migration 001. The app connects as a non-owner role and sets the organization per transaction, in both the API and the workers.
- A personal organization is created at sign-up.
- **Roles in the MVP: OWNER, EDITOR, REVIEWER.** EDITOR can edit and export; REVIEWER can only comment and approve.

**Why:** a cross-tenant leak is a P0 (Docs 11, 12, 14). Editor seats are part of the Pro and Studio plans (ADR-014), so roles are needed from the start.

**Supersedes:** Doc 09 `creator_id`, Doc 12 "workspace", and the earlier "OWNER only in MVP".

## ADR-003 — Domain language

**Decision:**

- **Content** = one video, the unit of work.
- **Project** = an optional series or folder.
- Content has versions, workflow runs, media assets, EDLs, approvals, exports and (later) publications.
- API routes use `/contents/:id/...`.

**Supersedes:** "Project = one video" in Docs 09 and 11.

## ADR-004 — Canonical states (extended)

One set of state enums in `packages/contracts`. Database checks, the API and the UI all use it.

- **Content:** DRAFT → PLANNING → PRODUCING → IN_REVIEW → APPROVED → PUBLISHING → PUBLISHED → ARCHIVED. In the MVP, "exported" is recorded on `export_jobs`; PUBLISHING and PUBLISHED are used from Phase 2.
- **Workflow run:** AWAITING_PLAN_APPROVAL → QUEUED → RUNNING → WAITING_FOR_REVIEW → COMPLETED, or FAILED / CANCELLED.
- **Step:** PENDING, READY, RUNNING, WAITING_FOR_REVIEW, SUCCEEDED, FAILED, SKIPPED, CANCELLED, STALE.
- **Approval:** PENDING, APPROVED, CHANGES_REQUESTED, REJECTED.
- **Publication (Phase 2):** DRAFT, QUEUED, UPLOADING, PROCESSING, SCHEDULED, PUBLISHED, FAILED, CANCELLED.
- **Recommendation:** NEW, VIEWED, ACCEPTED, DISMISSED, EXPIRED. Feedback (USEFUL, NOT_USEFUL, ALREADY_PLANNED, NOT_RELEVANT) and the measured outcome are kept separately.
- **New — Media asset:** UPLOADING, UPLOADED, PROCESSING, READY, FAILED, EXPIRED.
- **New — Edit decision:** SUGGESTED, ACCEPTED, REJECTED.
- **New — Export job:** QUEUED, RUNNING, READY, FAILED, EXPIRED.

**Confidence** is shown as High / Medium / Low, from sample size and effect size. Never show a percentage made up by an LLM.

## ADR-005 — API conventions

**Decision:**

- REST under `/api/v1`.
- On success: `{data, meta}`. On failure: `{error: {code, message, requestId, details}}`. The HTTP status says which.
- Cursor pagination.
- An `Idempotency-Key` on workflow start, export, billing and (Phase 2) publish.
- Zod schemas generate the OpenAPI spec and a typed client.

**Supersedes:** Doc 11's `{success, data, meta}`.

## ADR-006 — Stack

- **Repo:** pnpm + Turborepo monorepo.
- **Web:** Next.js (App Router) with TanStack Query, Tailwind and shadcn/ui.
- **Backend:** a NestJS API, plus a separate worker process built from the same code.
- **Data:** PostgreSQL 16+ with pgvector; Redis + BullMQ.
- **Media:** Cloudflare R2 storage; FFmpeg.

## ADR-007 — ORM

Drizzle, because it has first-class RLS policies, pgvector support and raw SQL for analytics. Decide once and don't switch.

## ADR-008 — Workflow execution

- PostgreSQL holds the workflow and step state; it is the source of truth.
- BullMQ runs the steps, and a transactional outbox enqueues the jobs.
- "Waiting for review" is a database state, not a sleeping job.
- Revisit Temporal or Trigger.dev if workflows grow long or complex.

## ADR-009 — Auth and YouTube grant

- Managed auth (Clerk, WorkOS, Auth0 or self-hosted Better Auth) with Google and email sign-in, and HttpOnly session cookies.
- YouTube is a **separate, optional** OAuth grant:
  - read-only scopes only, for the Channel Audit;
  - the upload scope is added later through incremental consent (Phase 2);
  - PKCE and state on every grant;
  - tokens encrypted with a KMS-managed key, in their own table.

**Supersedes:** Doc 11's Bearer tokens for the web app.

## ADR-010 — AI gateway

- Our own `AiGateway` interface, built on an existing multi-provider SDK.
- A capability → model config table, with a primary and a fallback model.
- Zod structured outputs; prompts versioned in git.
- An `ai_generations` row for every call, with its cost.
- Router v1 is a config table. Learned routing comes later, from acceptance data.

## ADR-011 — No Python service in MVP

FFmpeg and APIs cover the MVP. A FastAPI ml-service comes in Phase 3, for ranking, scene detection and alignment.

## ADR-012 — Billing (extended)

- A merchant of record: Polar, Paddle, or another provider that supports Sri Lankan sellers. Confirm eligibility before the paid beta.
- An `entitlements` table drives the limits; `usage_ledger` records footage minutes (ADR-014).
- Model fees as 7% + $0.50 per charge, all-in, until real statements show otherwise.

## ADR-013 — Hosting

- Vercel for the web app.
- A container platform for the API and workers.
- Managed PostgreSQL and managed Redis.
- R2 for media.
- A region near users (Mumbai or Singapore). Docker everywhere.

## ADR-014 — Price and meter by footage hours

**Decision:** plans are priced by **hours of raw footage per month**:

| Plan | Price | Footage | Seats |
| --- | --- | --- | --- |
| Free | $0 | 30 min | 1 |
| Creator | $19 | 5 h | 1 |
| Pro | $39 | 15 h | 2 |
| Studio | $99 | 40 h | 5 |

Extra footage costs $3 per hour. Usage is metered in minutes **before** the expensive steps run.

**Why:**

- Easy for creators to understand.
- Follows our real cost, since speech-to-text is charged per minute.
- No confusing credits.
- Typical gross margin is about 80%, and the worst case is about 57% (Doc 26 §8).

**Supersedes:** Doc 04's tiers, the credit system, and the $1.60-per-video target.

## ADR-015 — Audio-first media, NLE hand-off

**Decision:**

- The browser extracts and uploads the audio first, with an optional 360p–540p proxy. Originals stay on the creator's disk.
- Exports (FCPXML, Premiere XML, CMX3600 EDL, SRT, metadata) point to the original files, with a relink guide.
- Full-file resumable upload is the fallback; uploaded originals are deleted after 7 days.
- Full-resolution cloud render is a Phase 2 add-on.

**Why:**

- Upload speed in our first markets.
- Lower storage and compute cost.
- Creators finish in the editor they already use.

**Risk:** browser audio extraction from large files must be proven in a week-1 spike (WebCodecs or ffmpeg.wasm). If it fails, use full upload plus the 7-day deletion.

## ADR-016 — Speech-to-text language router

**Decision:**

- An `SttGateway` with the same rules as the AI gateway.
- Route by language: the cheapest good model for English (Deepgram Nova-3 batch is the baseline), and the provider that wins the week-1 benchmark for Sinhala–English, Tamil–English and Hindi–English.
- Store the provider and model on every transcript.

**Why:** quality on mixed South Asian speech is our possible edge, and it is not yet measured.

## ADR-017 — Do-not-build list

We will **not** build, in the MVP or Phase 2 without a new ADR:

- title/thumbnail A/B testing (YouTube has it free);
- generic analytics chat (Ask Studio);
- generated "faceless" video;
- auto-publish before the audit;
- cross-creator benchmarks from private analytics;
- a full timeline editor;
- our own speech or language models.

## ADR-018 — Regional pricing

**Decision:** South Asia pays about 50% of the global price. Use the merchant of record's regional pricing, or discount codes. Test the exact LKR and INR price points in pre-sales.

**Guardrail:** aim for at least half of revenue from global English-speaking creators by month 9 (Doc 26 §9).

## ADR-019 — Build order: copilot before Channel Audit

**Decision:**

- Build order: foundation (weeks 1–3), then the copilot core (weeks 3–8), then the free Channel Audit (weeks 6–9).
- Start Google OAuth verification in week 0 anyway.

**Why:** the paid product doesn't wait on Google's review, so revenue and learning start sooner.

**Supersedes:** the CTO plan's order (Channel Intelligence first, weeks 3–6).
