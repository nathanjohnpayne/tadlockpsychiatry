# Documentation Rules

Update documentation when any of the following change:

- System behavior
- Build or deployment steps
- Dependencies
- Directory structure

When behavior changes: update the appropriate `docs/agents/` sub-file
(and any other reading-order doc the change touches: `README.md`,
`.ai_context.md`) before or alongside the code change—not after. There
is no `specs/` directory in this repo; intended behavior lives in the
code, in source comments, and in per-PR commit messages.

`CLAUDE.md` at the repository root is a tool-specific config file
(loaded automatically by Claude Code). It is NOT a normal behavior-
documentation target: only edit it when the rules it gives the Claude
Code agent itself need to change (e.g., the canonical reading order or
the code-review workflow). Routine system-behavior updates that
already land in `docs/agents/` and `.ai_context.md` should not be
duplicated there.

When adding or removing an agent instruction section, update the
`AGENTS.md` index at the repository root.
