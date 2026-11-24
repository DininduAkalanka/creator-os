# Coding-agent prompt kit

These files set up any AI coding agent (Claude Code, Codex, Cursor and others) to build CreatorOS the same way every session.

| File | What it is | When to use |
| --- | --- | --- |
| `../AGENTS.md` | Standing rules: product, sources of truth, architecture, non-negotiables, the work loop, role checklists, Definition of Done | The agent reads it automatically or at the start of every session; you never paste it |
| `../CLAUDE.md` | Imports AGENTS.md for Claude Code, plus a few Claude Code notes | Automatic in Claude Code |
| `../docs/engineering/PROGRESS.md` | The agent's memory between sessions | The agent updates it at the end of every session |
| `01_KICKOFF_foundation.md` | First prompt: Step 1 foundation, milestones M0–M7 | Session 1, then one milestone per session |
| `02_TRACK_A_concierge_pipeline.md` | Validation pipeline and STT benchmark, milestones C0–C6 | In parallel with 01, in separate sessions |
| `03_LOOP_task_template.md` | Reusable task prompt + the task queue for Steps 2–5 | Every task after the foundation |
| `04_REVIEW_change.md` | Independent reviewer prompt | In a fresh session before every merge |

## The rhythm

1. Fresh session → paste the prompt (or "continue with the next milestone").
2. The agent plans. For schema, auth, tenancy, billing or public API work, **you approve the plan first**.
3. The agent tests, builds, verifies, updates PROGRESS.md, commits and reports.
4. Fresh session → run Prompt 04 (review). Fix any findings.
5. Merge, then start the next milestone.

## Your first message

> Continue with the next milestone in prompts/01_KICKOFF_foundation.md. Read AGENTS.md and docs/engineering/PROGRESS.md first.

M0 and M1 are done; PROGRESS.md always names the next milestone.
