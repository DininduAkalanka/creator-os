# Contracts reference (`packages/contracts`)

**Status:** built in M2 on 24 November 2026, branch `feat/m2-contracts`. The founder approved the transition maps (§2) as **ADR-024** and the error catalog and response details (§4–5) as **ADR-025** on 24 November 2026 ([Decision Log](../00_Decision_Log.md)).
**Rule:** the code is the source of truth, and this page explains it. Change both in the same commit, contracts first (AGENTS.md §4.2), after review (Doc 11 §89).
**Who uses it:** the database CHECKs (M3), the API's error filter, validation and OpenAPI (M5), the workflow engine (T2.1) and the web app.

---

## 1. What the package exports

Import everything from `@creatoros/contracts` (the import rules allow no deep imports).

| Area | Exports | Decision |
| --- | --- | --- |
| State machines | `defineStateMachine`, `canTransition`, `assertTransition`, `STATE_MACHINES`; per lifecycle: `contentMachine`, `CONTENT_STATUSES`, `ContentStatus`, `contentStatusSchema` (and the same for the others) | ADR-004, AGENTS.md §4.4 |
| Plain enums | `ROLES`, `CONFIDENCE_LEVELS`, `RECOMMENDATION_FEEDBACK_TYPES`, with their schemas and types | ADR-002, ADR-004 |
| Errors | `ERROR_CODES`, `ERROR_CATALOG`, `AppError`, `errorEnvelopeSchema`, `errorBodySchema`, `errorCodeSchema`, `invalidStateTransitionDetailsSchema` | ADR-005 |
| Success envelope | `dataEnvelope(schema)`, `pageEnvelope(itemSchema)`, `emptyMetaSchema` | ADR-005 |
| Pagination | `pageQuerySchema`, `pageMetaSchema`, `cursorSchema`, `PAGE_LIMIT_DEFAULT` (20), `PAGE_LIMIT_MAX` (100), `CURSOR_MAX_LENGTH` (512) | ADR-005 |
| IDs | `idSchema`, `newId()`, `Id` | ADR-022 |
| OpenAPI | `generateOpenApiDocument`, `errorResponses`, `jsonContent`, `API_BASE_PATH` (`/api/v1`) | ADR-005 |

Runtime dependencies: `zod` 4.6.7, `uuid` 14.0.3, `@asteasolutions/zod-to-openapi` 9.1.0 (which brings `openapi3-ts` and `yaml`). The package is side-effect free (`"sideEffects": false`), so the web app's bundle leaves out whatever it doesn't import, such as the OpenAPI generator.

---

## 2. State machines

**How to use them:**

- Call `assertTransition(machine, from, to)` before every status change. It throws `AppError` `INVALID_STATE_TRANSITION` (HTTP 409) with `details: { machine, from, to }`.
- The check is the rule, not the lock. The UPDATE must also require the old status (`… WHERE id = $1 AND status = $from`), so two workers can't both move one row (Doc 22 §101).
- Staying in the same state is never a transition. Repeated deliveries are handled with idempotency, not with a self-loop.
- `canTransition` returns `false`, and never throws, for values that aren't states (for example a bad value read from the database).

**How the maps were made:**

- ADR-004 lists the states, and for content and workflow runs it gives their order.
- Every other move comes from documented behaviour, named in the Source column.
- **Anything not listed is refused.** A missing move is added later by a reviewed contracts change; a wrong move that was allowed would be a bug.
- `states.test.ts` holds an independent copy of these tables. It fails if a map gains or loses a move, and it checks that every other pair is refused and that every state can be reached.

### content (one video, ADR-003)

| From | May move to | Source |
| --- | --- | --- |
| DRAFT | PLANNING | ADR-004 order |
| PLANNING | PRODUCING | ADR-004 order; the creator approves the plan and its cost estimate (Implementation Plan Step 2.2) |
| PRODUCING | IN_REVIEW | ADR-004 order |
| IN_REVIEW | APPROVED, PRODUCING | APPROVED: ADR-004 order. PRODUCING: request changes or reject, then the relevant steps run again (Step 2.9, Doc 26 §5.1, Doc 19 §45–46) |
| APPROVED | PUBLISHING, ARCHIVED | PUBLISHING: ADR-004 order (Phase 2, behind `youtube_publish`). ARCHIVED: in the MVP an exported content ends at APPROVED, because exports are recorded on `export_jobs` (ADR-004) |
| PUBLISHING | PUBLISHED | ADR-004 order |
| PUBLISHED | ARCHIVED | ADR-004 order |
| ARCHIVED | (final) | |

### workflow_run

| From | May move to | Source |
| --- | --- | --- |
| AWAITING_PLAN_APPROVAL | QUEUED, CANCELLED | QUEUED: ADR-004 order, once the plan and cost are approved (Step 2.2). CANCELLED: cancel (Step 2.3, T2.1) |
| QUEUED | RUNNING, CANCELLED | ADR-004 order; cancel |
| RUNNING | WAITING_FOR_REVIEW, FAILED, CANCELLED | ADR-004 ("waiting for review" is a database state, ADR-008); FAILED once a step has used its retries; cancel |
| WAITING_FOR_REVIEW | COMPLETED, QUEUED, CANCELLED | COMPLETED: ADR-004 order. QUEUED: a partial re-run during review (T2.1, Doc 19 §46). Cancel |
| FAILED | QUEUED | retry the failed step and continue (Doc 17 §83) |
| COMPLETED | (final) | |
| CANCELLED | (final) | |

### workflow_step

| From | May move to | Source |
| --- | --- | --- |
| PENDING | READY, SKIPPED, CANCELLED | READY: its `depends_on` steps are done (data model v1). SKIPPED: the template's conditions leave it out (Doc 17 §27). CANCELLED: the run is cancelled |
| READY | RUNNING, SKIPPED, CANCELLED | as above |
| RUNNING | WAITING_FOR_REVIEW, SUCCEEDED, FAILED, CANCELLED | WAITING_FOR_REVIEW: the output needs a person (ADR-008). FAILED: after retries with backoff (AGENTS.md §4.5) |
| WAITING_FOR_REVIEW | READY, SUCCEEDED, CANCELLED, STALE | READY: this step runs again (T2.1). STALE: an upstream step ran again (ADR-004) |
| SUCCEEDED | READY, STALE | partial re-run of this step (T2.1); an upstream step ran again |
| FAILED | READY | retry (Doc 17 §83) |
| STALE | READY, CANCELLED | runs again once its upstream steps are done |
| SKIPPED | (final) | |
| CANCELLED | (final) | |

A job's retries happen while its step stays RUNNING. If M6 wants a waiting retry to show as READY, that needs RUNNING → READY, added by a reviewed contracts change.

### approval

| From | May move to | Source |
| --- | --- | --- |
| PENDING | APPROVED, CHANGES_REQUESTED, REJECTED | approve, request changes or reject (Step 2.9) |
| APPROVED, CHANGES_REQUESTED, REJECTED | (final) | a decision is a record; the next round is a new approval for the new content version (data model v1) |

### publication (Phase 2, behind `youtube_publish`; review again in T4.3)

| From | May move to | Source |
| --- | --- | --- |
| DRAFT | QUEUED, CANCELLED | QUEUED only when the creator confirms; never publish automatically (Doc 11 §55) |
| QUEUED | UPLOADING, FAILED, CANCELLED | resumable upload (T4.3) |
| UPLOADING | PROCESSING, FAILED | |
| PROCESSING | SCHEDULED, PUBLISHED, FAILED | private or scheduled by default (Doc 26 §5.2) |
| SCHEDULED | PUBLISHED | |
| FAILED | QUEUED | retry with the same Idempotency-Key (Doc 11 §54, §56) |
| PUBLISHED, CANCELLED | (final) | |

### recommendation (Step 3)

| From | May move to | Source |
| --- | --- | --- |
| NEW | VIEWED, ACCEPTED, DISMISSED, EXPIRED | ADR-004's states. Acting on a recommendation implies the creator saw it, so NEW may skip VIEWED. EXPIRED: its expiry date passes (Doc 09 §30) |
| VIEWED | ACCEPTED, DISMISSED, EXPIRED | |
| ACCEPTED, DISMISSED, EXPIRED | (final) | feedback and the measured outcome are separate records (ADR-004) |

### media_asset

| From | May move to | Source |
| --- | --- | --- |
| UPLOADING | UPLOADED, FAILED | the presigned upload completes or fails (T2.3) |
| UPLOADED | PROCESSING | ffprobe validation in the worker (Step 2.4) |
| PROCESSING | READY, FAILED | invalid files are rejected with a clear error (T2.3) |
| READY | EXPIRED | retention: originals after 7 days, proxies after 30 days (ADR-015, Doc 26 §8.5) |
| FAILED, EXPIRED | (final) | |

### edit_decision

| From | May move to | Source |
| --- | --- | --- |
| SUGGESTED | ACCEPTED, REJECTED | accept or reject per cut, or all cuts of a type (Doc 26 §5.1, T2.6) |
| ACCEPTED | REJECTED | the reviewer changes their mind; every decision persists (T2.6) |
| REJECTED | ACCEPTED | as above |

### export_job

| From | May move to | Source |
| --- | --- | --- |
| QUEUED | RUNNING | |
| RUNNING | READY, FAILED | READY: the file is built (T2.7). FAILED: after its retries; a new export is a new job |
| READY | EXPIRED | the file is deleted after its expiry (data model v1) |
| FAILED, EXPIRED | (final) | |

### Refused for now (no document covers them)

These are question Q15 in PROGRESS.md:

- **content:** archive before approval (abandon a draft); restore from ARCHIVED; reopen the review after APPROVED; go back to APPROVED after a failed publish (Phase 2).
- **workflow_run:** run again after COMPLETED; cancel a FAILED run.
- **workflow_step:** FAILED or RUNNING → STALE when an upstream step runs again.
- **media_asset:** FAILED → EXPIRED when a failed upload's file is cleaned up.
- **publication:** cancel while UPLOADING or SCHEDULED.

---

## 3. Plain enums

| Enum | Values | Source |
| --- | --- | --- |
| `ROLES` | OWNER, EDITOR, REVIEWER | ADR-002 (REVIEWER can only comment and approve) |
| `CONFIDENCE_LEVELS` | HIGH, MEDIUM, LOW | ADR-004: from sample size and effect size, never an LLM-made percentage |
| `RECOMMENDATION_FEEDBACK_TYPES` | USEFUL, NOT_USEFUL, ALREADY_PLANNED, NOT_RELEVANT | ADR-004 |

Each database CHECK must equal its enum (PLAN.md §3 and §6 item 8). M3 tests this.

---

## 4. Errors (ADR-005)

Every failure has this body, and the HTTP status comes from the code:

```json
{ "error": { "code": "NOT_FOUND", "message": "We couldn't find what you asked for.", "requestId": "…", "details": { } } }
```

- `details` is optional. The schema is strict: no other fields, so no `success` flag and no `stack`.
- `message` is a plain English default. The web app shows its own translated text per code (AGENTS.md §5), so a message must never hold secrets or personal data.

| Code | HTTP | Category | Used for |
| --- | --- | --- | --- |
| BAD_REQUEST | 400 | Doc 11 §11 "Invalid request" | a request that can't be read, such as malformed JSON |
| UNAUTHENTICATED | 401 | Authentication error (Doc 17 §51) | no session, or an expired one (M4) |
| FORBIDDEN | 403 | Authorization error | not a member, or the role isn't allowed (M4) |
| NOT_FOUND | 404 | Not found | a missing resource or route; `details.resource` may name it |
| CONFLICT | 409 | Conflict | for example a value that must be unique already exists |
| INVALID_STATE_TRANSITION | 409 | Conflict (AGENTS.md §4.4) | `assertTransition` refused; `details: { machine, from, to }` |
| VALIDATION_FAILED | 422 | Validation error | the zod validation pipe (M5); M5 defines its `details` |
| RATE_LIMITED | 429 | Rate limit | the throttler (M5) |
| INTERNAL_ERROR | 500 | Internal server error | anything unexpected; the client never sees the original message |
| PROVIDER_FAILED | 502 | External API failure | AI, speech-to-text, storage or YouTube (Step 2 onward) |
| SERVICE_UNAVAILABLE | 503 | Doc 11 §11 "Service temporarily unavailable" | `/ready` fails (M5) |

**Why one generic NOT_FOUND:** Doc 11's examples use one code per resource (`PROJECT_NOT_FOUND`). The client handles all of them the same way, so a single code with `details.resource` keeps the catalog small.

**Codes added later, each in its own contracts commit:**

- Idempotency (M6): key missing, key reused with a different body, request still in progress (PLAN.md §6).
- Usage limit reached (T2.2).
- Provider timeout (Doc 11 §74, Step 2).

---

## 5. Success envelope and pagination

| Response | Shape |
| --- | --- |
| One resource | `{ "data": { … }, "meta": {} }` |
| One page of a list | `{ "data": [ … ], "meta": { "nextCursor": "…" } }`, where `nextCursor` is `null` on the last page |

Both shapes are strict, like the error envelope.

**List requests** use `?cursor=<cursor>&limit=<n>`:

- `limit` is 1–100 and defaults to 20 (the examples in Doc 11 §77 and Doc 17 §74). Query strings arrive as text, so `"50"` is read as 50; `"0"`, `"101"`, `"1.5"` and `"abc"` are refused.
- The cursor is opaque base64url text, 1–512 characters. Only the API creates and reads it, and its encoding may change between releases.
- Lists have no total counts: counting every row on every page is slow on large tables.

---

## 6. IDs (ADR-022, PLAN.md §5)

- `newId()` returns a UUID v7 (from `uuid` 14). IDs from one process are strictly increasing, even within one millisecond, which keeps index inserts in order.
- `idSchema` accepts RFC 9562 version 7 UUIDs. It checks the version and variant bits, and accepts upper case on input, as the RFC allows. The API always returns lower case.
- A v7 ID shows when it was created. Never use one as a secret; share links get separate random tokens.

---

## 7. OpenAPI (ADR-005)

- **Component names** live on the schemas in zod's own `.meta({ id })`: `ErrorEnvelope`, `ErrorCode`, `Id`, `Cursor`, `PageMeta` and each `…Status` enum. These names become the type names in the generated client.
- **No prototype patch:** zod's prototype is never patched (`extendZodWithOpenApi` is not used). Because of that, `registry.register()` isn't available, so a component appears in the document only once a registered route uses it.
- **`generateOpenApiDocument(registry, info)`** returns an OpenAPI 3.1.0 document with `servers: [{ url: "/api/v1" }]` and components sorted alphabetically, so diffs stay stable.
- **`errorResponses([401, 422])`** adds error responses that point at `ErrorEnvelope` and list each status's codes.

M5 registers the routes, serves the document at `/api/v1/openapi.json` and generates `packages/api-client` from it.

---

## 8. Tests

`pnpm --filter @creatoros/contracts test` runs the unit tests with v8 coverage, and fails below 95% statements, branches, functions or lines.

At M2: 158 tests and 100% coverage.

Checked by breaking the code on purpose; each break failed the suite:

- an extra transition;
- a missing retry transition;
- a changed HTTP status;
- an untested function (coverage fell to 92.85% and the command exited with code 1).
