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

- Vite (multi-page) + React 18 + TypeScript — `vite.config.ts` defines
  one HTML entry per surface (gate `/`, `/menu`, `/d/1`, `/d/2`, `/d/3`).
  `npm run build` emits `dist/` which Firebase Hosting serves.
- The build is wired in as a Hosting predeploy hook
  (`firebase.json` → `hosting.predeploy`), so `firebase deploy --only
  hosting` runs `npm run build` before uploading.
- The migration is in progress per #20. Phase 1 (#21) sits at the
  toolchain level only; `src/*.js` remain JavaScript and continue to
  import the Firebase SDK from `gstatic.com` URLs (marked external in
  the Vite config). Phases 2–6 port the public surface and protected
  prototypes to TS and replace the runtime Babel loader with built ESM.
- Firebase Hosting + Firebase Storage (storage.rules gates
  `protected/`).
- Firebase Analytics (GA4 measurement id `G-R8TK2SVVS0`).

## Agent Role

Maintain the site content, the agent-tooling infrastructure, and the
review-policy workflow. Keep `dist/` and other build artifacts out of
git. Drive the #20 migration phase by phase rather than expanding the
toolchain speculatively beyond what each phase needs.

See `.ai_context.md` for hosting identifiers and deploy tooling.
