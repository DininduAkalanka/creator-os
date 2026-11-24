# Prompt 03 — The task loop (reuse for every task after the foundation)

**How to use:**
1. Copy the template, fill in the `<…>` parts from the task queue below, and paste it into a **fresh** agent session.
2. When the agent reports, run Prompt 04 (review) in another fresh session before you merge.
3. Then move to the next task.

---

You are working on CreatorOS (internal code name) as the founding engineering team. Read `AGENTS.md` and follow it: the rules, the work loop in §7, the role checklists in §8 and the Definition of Done in §9. Then read `docs/engineering/PROGRESS.md`.

**Task:** <task ID and title>
**Plan reference:** <Implementation_Plan step / Document 26 section / ADR numbers>
**Why it matters:** <one sentence: the creator or business outcome>
**Exit test:** <observable result, plus the tests that prove it>
**In scope:** <bullets>
**Out of scope:** <bullets: things not to build now>
**Constraints:** <performance, cost, security or compatibility limits, if any>

Run the loop:
1. **Orient:** restate the goal, the exit test and what is out of scope.
2. **Plan:** files, contracts, migrations, tests, risks, questions. Wait for my OK if it touches schema, auth, tenancy, billing, the public API or a paid service.
3. **Tests first.**
4. **Implement** in small steps.
5. **Verify** with the full gate, plus integration tests where data or queues are involved.
6. **Self-review** with every role checklist.
7. **Update PROGRESS.md.**
8. **Commit.**
9. **Report** in the AGENTS.md §7 format.

---

## Task queue after Step 1 (from the Implementation Plan)

Run them in this order. Each line gives the scope and the exit test to put in the template.

### Step 2 — Production Copilot (weeks 3–8)

| ID | Task | Exit test |
| --- | --- | --- |
| T2.1 | Contents and workflow engine: `contents`, `workflow_runs`, `workflow_steps`, templates (talking-head, screen-recording, podcast), cancel, retries, partial re-run that marks downstream steps STALE | Integration tests for start, cancel, retry, re-run → STALE, and cross-tenant isolation |
| T2.2 | Entitlements and `usage_ledger` (minimal): plan limits in footage minutes, a check before expensive steps | A job is refused with a clear error code once a test org is over its limit; the ledger row and the job start share one transaction |
| T2.3 | Audio-first upload: browser audio extraction (from spike C6), presigned multipart upload to local S3/R2, `media_assets`, ffprobe validation in the worker, full-upload fallback with 7-day deletion | A 1-hour file uploads its audio in minutes on a throttled connection; invalid files are rejected with a clear error |
| T2.4 | `SttGateway` and the transcription step: port the concierge C1 code, language routing config, `transcripts` and `transcript_words`, cost logged | The transcript appears for English with filler words kept (verbatim setting on); cost is recorded per footage minute |
| T2.5 | Cut detection step: port C2 into `packages/media` and the AI worker; `edit_decision_lists` and `edit_decisions` | EDL generated and stored with versions; matches the concierge output on the same file |
| T2.6 | Review UI: transcript with cuts highlighted, proxy or audio preview that skips cut ranges, accept/reject (single and by type), captions editor | A creator reviews a 20-minute video using only the keyboard; every decision persists |
| T2.7 | Exporters and `export_jobs`: port C3 (FCPXML, Premiere XML, CMX3600, SRT, metadata), signed download | Exports open with cuts intact in Resolve, Premiere and Final Cut (human check); golden tests in CI |
| T2.8 | Packaging: titles, description and chapters through `AiGateway`, thumbnail frame ideas, eval set of 30+ cases | The eval runs in CI; a regression blocks the merge; cost is logged |

**Step 2 gate:** on 5 real videos, at least 40% hands-on time saved and at least 70% of cuts accepted.

### Step 3 — Free Channel Audit (weeks 6–9)

| ID | Task | Exit test |
| --- | --- | --- |
| T3.1 | YouTube OAuth (read-only, PKCE, encrypted tokens, refresh, revoke, disconnect) + privacy-policy text for the website | Connect and disconnect work; tokens are never in logs; revoking deletes the stored data |
| T3.2 | Import the channel and its last 50–200 videos, a daily analytics sync, a 30-day refresh job, the Reporting API job at connect | `refreshed_at` is set on every record; the refresh job is tested with fake time |
| T3.3 | Baselines, 5–8 evidence-based insights (LLM explains only from the evidence), High/Medium/Low confidence, feedback buttons | First insight in under 5 minutes; the number-check rejects any figure not in the evidence |

### Step 4 — Editor seats and publishing prep (weeks 8–11)

| ID | Task | Exit test |
| --- | --- | --- |
| T4.1 | Invites, the EDITOR and REVIEWER roles, `review_comments`, `approvals` | A creator and an editor finish one video together; role tests for each endpoint |
| T4.2 | Creator memory v1 (`creator_style_profiles`): learn the silence threshold and the rejected cut types | The second video's suggestions reflect the first video's rejections (test with fixtures) |
| T4.3 | Publish flow behind `youtube_publish` (off): resumable upload, private by default, AI-disclosure question, Idempotency-Key | Works on internal test channels only; the flag is off in every deployed environment |

### Step 5 — Limits, billing and hardening (weeks 10–12)

| ID | Task | Exit test |
| --- | --- | --- |
| T5.1 | Billing via the merchant of record: checkout, idempotent webhooks, entitlement sync, one USD price list (ADR-020) | Replaying a webhook doesn't double-grant; downgrades enforce limits |
| T5.2 | Internal cost dashboard: cost per workflow, per org, per footage hour | Matches the `ai_generations` and `usage_ledger` totals |
| T5.3 | Storage lifecycle: proxy and original deletion jobs | Files past retention are gone; tested with fake time |
| T5.4 | Security pass, runbooks (failed job, revoked token, provider outage, quota), backup restore drill | Doc 14 P0 release gate passes |
