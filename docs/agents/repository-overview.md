# Repository Overview

This repository is **Tadlock Psychiatry** — the marketing/information
website at [tadlockpsychiatry.com](https://tadlockpsychiatry.com), hosted
on Firebase Hosting with Firebase Analytics.

It was scaffolded from the AI Agent Tooling Standard template
([Mergepath](https://github.com/nathanjohnpayne/mergepath)), so the
agent-tooling files (AGENTS.md, REVIEW_POLICY.md, scripts/, .github/
workflows, rules/, docs/agents/) follow the standard. The application
surface is a hand-rolled static site at the repo root.

## Tech Stack

- HTML / CSS / JavaScript (no build step today)
- Firebase Hosting
- Firebase Analytics (GA4 measurement id `G-R8TK2SVVS0`)

## Agent Role

Maintain the site content, the agent-tooling infrastructure, and the
review-policy workflow. Keep `dist/` (if introduced later) and other
build artifacts out of git. Do not introduce a build pipeline or
framework speculatively — only when the content actually requires it.

See `.ai_context.md` for hosting identifiers and deploy tooling.
