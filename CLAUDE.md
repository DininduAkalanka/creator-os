@AGENTS.md

## Claude Code notes

- Use plan mode for step 2 of the work loop (AGENTS.md §7) on any task that touches schema, auth, tenancy, billing or the public API.
- Run `/clear` between milestones; reload state from `docs/engineering/PROGRESS.md`.
- Ask before running anything that needs network access beyond the package registry, or that creates cloud resources.
