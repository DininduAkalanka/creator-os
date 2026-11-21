# CreatorOS

An AI first-pass editor and review workspace for YouTube creators.

- **Input:** raw footage.
- **Output:** a rough cut, captions, chapters, titles and thumbnail ideas.
- **Review:** in the browser, alone or with your editor.
- **Hand-off:** export to Premiere Pro, DaVinci Resolve or Final Cut Pro.

A free Channel Audit shows what to film next.

Status: planning and validation. The pre-launch website (`apps/www`) is built as a preview; the product itself has no code yet.

- [Documentation index](docs/README.md)
- [Document 26: Revised SaaS Foundation & Unit Economics](docs/26_Revised_SaaS_Foundation_and_Unit_Economics.md)
- [Decision Log](docs/00_Decision_Log.md)
- [Implementation Plan](docs/Implementation_Plan.md)
- [AGENTS.md](AGENTS.md): rules for AI coding agents, and the [prompt kit](prompts/README.md)

## Repository layout

```
AGENTS.md                 standing rules for AI coding agents
CLAUDE.md                 Claude Code entry point (imports AGENTS.md)
apps/
  www/                    pre-launch website (Next.js): home, waitlist, privacy, terms, about
packages/
  config/                 shared TypeScript config
.github/                  CI (format, lint, typecheck, test, build, Docker build, secret scan, audit), Dependabot
compose.yaml              local containers (today: the website, `pnpm docker:www`)
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

## Local development

Keep the code outside OneDrive or any other synced folder (for example `C:\dev\creator-os`); syncing `node_modules` is slow and breaks installs.

Requirements: Node 26.13.1 (see `.nvmrc`) and pnpm 12 (the exact version is in `package.json` under `packageManager`).

```bash
pnpm install
cp .env.example .env.local    # optional: defaults work for local use
pnpm dev                      # http://localhost:3000
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build   # run before every commit
```

### Run the website in Docker

Needs Docker Desktop running. This builds the production image and serves it like a real deployment:

```bash
pnpm docker:www               # build and start -> http://localhost:3000
pnpm docker:www:logs          # follow the logs
pnpm docker:down              # stop and remove the container
```

- Use it to check the production build. For day-to-day work, `pnpm dev` is faster: it reloads on every change.
- Both use port 3000, so stop one before starting the other. For another port, set `WWW_PORT=3100` before `pnpm docker:www`.
- `NEXT_PUBLIC_SITE_URL` is baked in at build time; rebuild after changing it.
- The container runs as a non-root user, with a read-only filesystem and no extra Linux capabilities.

### The website (`apps/www`)

- Brand and company details live in `apps/www/src/config/site.ts`. Unknown values are `null` and show as **[to be added]** on the site. Never fill them with guesses.
- A preview notice lists what still blocks launch (product name, company details, lawyer review, waitlist storage). It disappears only when all of them are done.
- The waitlist form validates input but **does not store anything yet**. It tells visitors so. Storage needs the approved waitlist schema, a database and an email provider.
- Search engines are kept out unless `SITE_INDEXABLE=true`. Set it only on the launched production site.
- Page text lives in `apps/www/src/content/`, apart from layout code, so it can be translated later.
