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
  web/                    the CreatorOS app (Next.js, port 3001): a start page until the app shell (M7)
  api/                    REST API under /api/v1 (NestJS 12, ESM, port 4000)
  worker/                 background jobs (Node, ESM): starts and stops cleanly; queues arrive in M6
packages/
  config/                 shared presets: TypeScript, ESLint, the import rules, the dev runner
  contracts/              enums, schemas, error codes, envelope, IDs (M2); imports nothing internal
  db/                     Drizzle schema, migrations, row-level security (M3)
  ui/                     shared React components (M7)
.github/                  CI (format, lint, typecheck, test, build, Docker build, secret scan, audit), Dependabot
compose.yaml              local containers: PostgreSQL + pgvector, S3 (RustFS), the website (`pnpm docker:www`)
docker/                   container setup files (the database's first-start roles script)
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
  design/                 website-design.md (design system, research, quality bar)
  models/                 unit_economics.py
```

Doc files are named `NN_Title.md`, where `NN` is the document number used in cross-references ("Doc 26 §8").

## Local development

Keep the code outside OneDrive or any other synced folder (for example `C:\dev\creator-os`); syncing `node_modules` is slow and breaks installs.

Requirements: Node 26.13.1 (see `.nvmrc`) and pnpm 12 (the exact version is in `package.json` under `packageManager`).

```bash
pnpm install
cp .env.example .env.local    # optional: defaults work for local use
pnpm dev                      # website :3000, app :3001, API :4000/api/v1, and the worker
pnpm --filter @creatoros/api dev   # one app only
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm lint:deps   # run before every commit
pnpm test:e2e                 # end-to-end + accessibility tests (Playwright + axe; uses your installed Microsoft Edge)
```

`pnpm lint:deps` checks the import rules: apps never import other apps, packages never import apps, `contracts` imports nothing internal, the app never imports server packages (`db`, `ai`, `media`), and no package is imported through its internal files.

### Local database and S3

Needs Docker Desktop running. First time:

1. Copy the "Local database and S3" block of `.env.example` into `.env` at the repo root, with your own long random values.
2. Copy the `packages/db` block into `packages/db/.env.local`, with the same passwords in the URLs.

```bash
docker compose up -d          # PostgreSQL 18 + pgvector on 127.0.0.1:5432, S3 (RustFS) on 127.0.0.1:9000
pnpm db:migrate               # create or update the schema (safe to run again)
pnpm db:seed                  # two example users and their organizations (safe to run again)
pnpm test:int                 # integration tests; they start their own database, not this one
docker compose stop           # stop both, keeping the data
```

- The database creates its roles (`creatoros_migrator`, `app_user`, `auth_service`, `tenant_bootstrap`) on its first start, from `packages/db/sql/roles`. To start over with new passwords, run `docker compose down --volumes`. This deletes the local data.
- Tenant tables use forced row-level security. The app only reads and writes through `withOrgTx` in `packages/db` (see `docs/engineering/PLAN.md` §3).

### Run the website in Docker

Needs Docker Desktop running. This builds the production image and serves it like a real deployment:

```bash
pnpm docker:www               # build and start -> http://localhost:3000
pnpm docker:www:logs          # follow the logs
pnpm docker:down              # stop and remove the website container (the database keeps running)
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
- Design system, research and quality bar: [docs/design/website-design.md](docs/design/website-design.md).
- Photos and videos: originals go in `apps/www/media-src/` (not committed); run `pnpm --filter @creatoros/www media` to make web-ready copies. Website videos live in `apps/www/public/videos/`. Every AI-generated photo or video must keep its on-page label.
