# AGENTS.md — CreatorOS (internal code name)

This file is the standing brief for every AI coding agent working in this repo: Claude Code, Codex, Cursor, Copilot and others. Read it fully at the start of every session. If anything here conflicts with a request, stop and say so.

---

## 1. What we are building

An **AI first-pass editor and review workspace for YouTube creators**:

1. The creator drops in raw footage. We upload the **audio first**, plus an optional small proxy; originals stay on the creator's disk.
2. We return a **rough cut** (an Edit Decision List: silences, filler words, retakes), **captions**, **chapters**, **title options** and **thumbnail ideas**.
3. The creator, or their editor, **reviews** every suggestion: accept or reject cuts, add time-coded comments, approve.
4. They **export** a timeline (FCPXML, Premiere XML, CMX3600 EDL) plus SRT and metadata, and finish in Premiere Pro, DaVinci Resolve or Final Cut Pro.
5. A free, read-only **Channel Audit** (YouTube APIs) brings creators in. **Publishing to YouTube is Phase 2**: build it behind the `youtube_publish` flag, kept off.

Pricing is per **hour of raw footage** (Free 30 min, Creator $19 for 5 h, Pro $39 for 15 h, Studio $99 for 40 h). Usage is metered in footage minutes.

The product name is **not final**. "CreatorOS" / `creatoros` is the internal code name. Keep user-facing brand text in one config constant (`BRAND`), never scattered through the UI.

---

## 2. Sources of truth (read in this order)

| # | File | Use |
| --- | --- | --- |
| 1 | `docs/00_Decision_Log.md` | ADR-001 to 020. **Wins over everything.** |
| 2 | `docs/26_Revised_SaaS_Foundation_and_Unit_Economics.md` | Scope, MVP in/out, pricing, metering, data additions (§14) |
| 3 | `docs/Implementation_Plan.md` | Steps, exit tests, data model v1, engineering standards, beta metrics |
| 4 | `docs/engineering/PROGRESS.md` | Where we are now, what's next, open questions |
| 5 | `docs/engineering/PLAN.md` | The engineering plan written in milestone M0 |
| 6 | Docs 01–25 | Detail on one topic only. Read the status banner at the top first. If they conflict with 1–3, follow 1–3. |

- Never load all docs at once. Search (`grep -n`) for the section you need and read only that part.
- If a doc is missing or unclear, write the question into PROGRESS.md and ask. Never invent requirements.

---

## 3. Architecture (MVP)

```
apps/
  web/        Next.js App Router: marketing shell + app UI (later split: apps/www for the marketing site)
  api/        NestJS REST API under /api/v1
  worker/     Node worker process(es): media, ai, youtube queues (same codebase, scaled separately)
packages/
  contracts/  zod schemas, state enums + transition maps, error codes, envelope, IDs (no runtime deps on apps)
  db/         Drizzle schema, migrations, withOrgTx(), seed
  ai/         AiGateway + SttGateway, prompt files, provider adapters, cost tables
  media/      FFmpeg helpers, EDL model, exporters (FCPXML / Premiere XML / CMX3600 / SRT)
  api-client/ typed client generated from OpenAPI
  ui/         shared React components (shadcn/ui based)
  config/     tsconfig, eslint, prettier, vitest presets
tools/
  concierge/  validation pipeline scripts (Track A); becomes pipeline v0
```

**Request flow:**
1. The browser uploads to object storage through a signed URL.
2. In **one transaction**, the API writes the state change and an `outbox_events` row.
3. The worker relays the outbox to BullMQ and runs the steps.
4. Workers write the results and step state back to PostgreSQL.

**Import rules:** apps never import other apps. Packages never import apps. `contracts` imports nothing internal.

---

## 4. Non-negotiables (check every change against these)

1. **Tenancy.**
   - Every tenant table has `organization_id uuid NOT NULL`, plus an `(organization_id, created_at)` index.
   - Enable RLS **and** `FORCE ROW LEVEL SECURITY` in the same migration that creates the table.
   - The app connects as `app_user`, which is not the table owner and has no `BYPASSRLS`.
   - Every request and every job runs inside `withOrgTx(orgId, fn)`, which does `SET LOCAL app.current_org_id`.
   - Every new tenant table gets a cross-tenant test.
2. **Contracts first.** Enums, zod schemas, error codes and the envelope live in `packages/contracts`. Change them in their own commit, before the code that uses them.
3. **API shape.**
   - Success returns `{data, meta}`; failure returns `{error: {code, message, requestId, details}}`. The HTTP status says which.
   - Use cursor pagination.
   - Require an `Idempotency-Key` on workflow start, export and billing.
4. **State machines.** Change state only through transition functions in contracts (`assertTransition`). Database `CHECK` constraints must match the enums.
5. **Workflows.**
   - PostgreSQL holds the workflow and step state; BullMQ only executes.
   - Jobs are idempotent, with retries, backoff and a DLQ.
   - "Waiting for review" is a database state, never a sleeping job.
6. **AI.**
   - Every model call goes through `AiGateway` / `SttGateway`, with a zod output schema, a budget check before the run, and an `ai_generations` row with its cost.
   - Prompts are versioned files in `packages/ai/prompts`.
   - Untrusted text (transcripts, titles, comments) is passed as data, never as instructions.
   - Models get no tool that publishes, deletes or bills.
7. **Media.**
   - Never upload or process 4K originals in the MVP.
   - FFmpeg runs in the worker with timeouts and size limits, and only on paths it created.
   - Signed URLs expire in 15 minutes or less.
8. **Secrets.**
   - Never put secrets in code, logs, test fixtures or commits. Only `.env.example` is committed.
   - OAuth tokens are encrypted at rest, in their own table, behind a restricted role.
9. **YouTube.**
   - Read-only scopes only.
   - Every stored YouTube record has a `refreshed_at`.
   - No publish code path runs unless the `youtube_publish` flag is on (it is off).
10. **Metering.** Check footage minutes against entitlements **before** expensive steps. Write the `usage_ledger` row in the same transaction that starts the job.
11. **No fake success.**
    - No stubbed AI responses outside tests.
    - No `TODO` that returns success.
    - No silently swallowed errors.
    - No hard-coded demo data in production code paths.

---

## 5. Stack and conventions

- **TypeScript.** `strict: true` everywhere. No `any` without a one-line comment that explains why.
- **Node.** The current Active LTS, pinned in `.nvmrc` and `engines`. Use pnpm workspaces and Turborepo.
- **Web.** Next.js App Router, TanStack Query, Tailwind, shadcn/ui. Use the generated typed API client, never hand-written fetch calls to our own API.
- **API.** NestJS. Validate with zod at every edge. Generate OpenAPI from zod.
- **DB.** PostgreSQL with pgvector, Drizzle ORM, and drizzle-kit migrations (read the generated SQL before committing).
  - IDs are UUID v7.
  - Use `timestamptz`, money in integer cents, durations in milliseconds.
- **Queue.** Redis + BullMQ.
- **Storage.** S3 API (MinIO locally, Cloudflare R2 in production).
- **Tests.**
  - Vitest for unit tests.
  - Testcontainers (real Postgres and Redis) for integration tests.
  - Playwright for end-to-end tests.
  - Recorded fixtures for third-party APIs, never live creator channels.
- **Observability.** OpenTelemetry traces; pino JSON logs that redact tokens, cookies and auth headers; Sentry.
- **Naming.** Files `kebab-case.ts`; React components `PascalCase.tsx`; DB tables and columns `snake_case`; env vars `UPPER_SNAKE`.
- **Dependencies.**
  - Check the current stable version with `pnpm view <pkg> version` before adding one; never guess versions from memory.
  - Prefer well-maintained packages.
  - Explain each new dependency in the commit message.
  - Don't add a dependency for something you can write clearly in under 30 lines.
- **Text.** UI strings are i18n-ready. English first; other languages only when demand justifies them (ADR-020). Test with non-Latin and right-to-left text.

---

## 6. Commands

Fill these in during M1. Keep them accurate whenever scripts change.

```bash
pnpm install
docker compose up -d          # postgres+pgvector, redis, minio
pnpm db:migrate               # apply migrations
pnpm dev                      # web + api + worker
pnpm lint && pnpm typecheck && pnpm test && pnpm build   # the local gate
pnpm test:int                 # integration tests (Testcontainers)
pnpm test:e2e                 # Playwright
```

---

## 7. The work loop (run it for every task)

1. **Orient.** Read PROGRESS.md, the task, and only the doc sections it needs. Restate in 3–5 lines: the goal, the exit test, and what is out of scope.
2. **Plan.** List the files to change, any contract or migration changes, the tests you will write, the risks, and your questions.
   - **Stop for human approval** if the task touches the DB schema, auth, tenancy/RLS, billing, the public API shape, or adds a paid service.
3. **Test first** where practical: write the failing test for the exit test.
4. **Implement** in small steps. Run typecheck and the relevant tests after each step.
5. **Verify.**
   - Run the full local gate, plus `test:int` if the DB or queues are involved.
   - Report the real command output summary.
   - Never claim something passes without running it.
6. **Self-review** with the role checklists in §8. Fix what you find.
7. **Record.**
   - Update `docs/engineering/PROGRESS.md`: done, next, open questions, decisions needed.
   - Update §6 if commands changed.
   - Propose an ADR in PROGRESS.md for any new decision. Never edit an accepted ADR yourself.
8. **Commit.** Use Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`), one logical change per commit. Don't push, merge or deploy unless asked.
9. **Report** in this format:

```
## <Task/Milestone> report
Status: done | blocked | needs review
What changed: <files/areas, 3–8 bullets>
How verified: <commands run + results>
Decisions made / proposed: <...>
Risks or follow-ups: <...>
Next: <the next task>
Needs from you: <accounts, keys, approvals, answers>
```

**Stop and ask** when:
- a request conflicts with the Decision Log;
- you need a new external service, a paid account or an API key;
- an operation is destructive (dropping tables, deleting data, `rm -rf` outside build folders, force-push, rewriting history);
- the same fix has failed 3 times (report your hypotheses instead of continuing);
- the scope grows past the task.

**Never:**
- weaken, skip or delete a test to make it pass;
- disable lint or type rules to get green;
- catch and ignore an error;
- invent an API response or a library function;
- commit to `main` directly;
- touch files outside the repo.

---

## 8. Role checklists (self-review)

- **Staff engineer:** Does it match the ADRs? Is it the simplest design that meets the exit test? Are the package boundaries respected? Is anything built that the task didn't ask for?
- **Backend:** Is input validated at the edge? Are transactions correct? Is it idempotent where retried? Does it use the error-code catalog? Is there pagination? Are there N+1 queries? Are timeouts set?
- **Frontend:** Are loading, empty and error states covered? Is it accessible (labels, keyboard, focus, contrast)? Does it use the typed client? Are there no secrets in the client bundle? Does it handle non-Latin and right-to-left text?
- **QA:** Are there unit tests and integration tests? Is there a cross-tenant test for new data? Are edge cases covered: empty, maximum size, unicode, concurrency, retries?
- **Security:**
  - Does every route check auth and membership/role?
  - Is RLS on for every tenant table?
  - Are size limits enforced?
  - Is there any SSRF or path-traversal risk in media handling?
  - Do signed URLs expire?
  - Are logs redacted?
  - Are the OWASP Top 10 covered?
- **AI/ML engineer:** Is there an output schema? Was an evaluation case added? Is the cost logged and the budget enforced? Is there a fallback model? Was the prompt version bumped? Is there a prompt-injection test?
- **SRE:** Are health and readiness checks in place? Are there retries with backoff, a DLQ, and metrics or logs for failures? Is the migration backward-compatible? Is a rollback note included?

---

## 9. Definition of Done

- The exit test is met and demonstrated.
- The local gate and CI are green.
- New behaviour has tests, including cross-tenant tests where tenant data is involved.
- Contracts, OpenAPI and generated client are updated. The migration SQL has been reviewed.
- AI and media steps log their cost.
- PROGRESS.md is updated, and docs are updated if behaviour changed.

---

## 10. Context management

- One milestone or task per session. Start a fresh session for the next one; PROGRESS.md is the memory between sessions.
- Read a file before you edit it. For large docs, search instead of reading them whole.
- Keep each change reviewable: aim for under about 400 changed lines, excluding lockfiles and generated code.
- When unsure, ask one precise question rather than guessing.
