# CreatorOS

An AI first-pass editor and review workspace for YouTube creators.

- **Input:** raw footage.
- **Output:** a rough cut, captions, chapters, titles and thumbnail ideas.
- **Review:** in the browser, alone or with your editor.
- **Hand-off:** export to Premiere Pro, DaVinci Resolve or Final Cut Pro.

A free Channel Audit shows what to film next.

Status: planning and validation. No product code yet.

- [Documentation index](docs/README.md)
- [Document 26: Revised SaaS Foundation & Unit Economics](docs/26_Revised_SaaS_Foundation_and_Unit_Economics.md)
- [Decision Log](docs/00_Decision_Log.md)
- [Implementation Plan](docs/Implementation_Plan.md)
- [AGENTS.md](AGENTS.md): rules for AI coding agents, and the [prompt kit](prompts/README.md)

## Repository layout

```
AGENTS.md                 standing rules for AI coding agents
CLAUDE.md                 Claude Code entry point (imports AGENTS.md)
prompts/                  coding-agent prompt kit (01 kickoff … 04 review)
docs/
  README.md               documentation index: start here
  00_Decision_Log.md      accepted ADRs; wins over every other doc
  01_…05_*.md             strategy and business
  06_…08_*.md             product
  09_…25_*.md             engineering
  26_*.md                 revised SaaS foundation and unit economics (current)
  Implementation_Plan.md  step-by-step build plan
  engineering/            PROGRESS.md (agent memory), PLAN.md (written in M0)
  models/                 unit_economics.py
```

Doc files are named `NN_Title.md`, where `NN` is the document number used in cross-references ("Doc 26 §8").
