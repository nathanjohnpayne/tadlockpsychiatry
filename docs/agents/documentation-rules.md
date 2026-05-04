# Documentation Rules

Update documentation when any of the following change:

- System behavior
- Build or deployment steps
- Dependencies
- Directory structure

When behavior changes: update the appropriate `docs/agents/` sub-file
(and any other reading-order doc the change touches: `README.md`,
`.ai_context.md`, `CLAUDE.md`) before or alongside the code change—not
after. There is no `specs/` directory in this repo; intended behavior
lives in the code, in source comments, and in per-PR commit messages.

When adding or removing an agent instruction section, update the
`AGENTS.md` index at the repository root.
