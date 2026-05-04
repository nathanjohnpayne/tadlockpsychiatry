# Repository Overview

This repository is **Tadlock Psychiatry** — the marketing/information
website at [tadlockpsychiatry.com](https://tadlockpsychiatry.com), hosted
on Firebase Hosting with Firebase Analytics.

It was scaffolded from the AI Agent Tooling Standard template
([Mergepath](https://github.com/nathanjohnpayne/mergepath)), so the
agent-tooling files (AGENTS.md, REVIEW_POLICY.md, scripts/, .github/
workflows, rules/, docs/agents/) follow the standard. The application
surface is a Vite-built multi-page site (sources in `src/` + the per-
surface `index.html` entries; build output in `dist/`, which is what
Firebase Hosting serves).

## Tech Stack

- Vite (multi-page) + React 18 + TypeScript — `vite.config.ts` defines
  one HTML entry per surface (gate `/`, `/menu`, `/d/1`, `/d/2`, `/d/3`).
  `npm run build` emits `dist/` which Firebase Hosting serves.
- The build is wired in as a Hosting predeploy hook
  (`firebase.json` → `hosting.predeploy`), so `firebase deploy --only
  hosting` runs `npm run build` before uploading.
- The migration is in progress per #20. Phases 1 (#21, toolchain) and
  2 (#22, TS port + npm-resolved `firebase@^11`) are merged: the
  public-surface modules are `src/auth.ts` / `src/firebase-config.ts` /
  `src/direction-loader.ts` plus `src/types.ts` and `src/global.d.ts`.
  Vite bundles Firebase into the auth chunk, so the only external CDN
  imports left are the unpkg React/Babel UMD scripts loaded by the
  direction shells and the Google Fonts CSS. Phases 3–6 port the
  protected content to TS, replace the runtime Babel loader with built
  ESM, and ship #11's responsive refinements.
- Firebase Hosting + Firebase Storage (storage.rules gates
  `protected/`).
- Firebase Analytics (GA4 measurement id `G-R8TK2SVVS0`).

## Agent Role

Maintain the site content, the agent-tooling infrastructure, and the
review-policy workflow. Keep `dist/` and other build artifacts out of
git. Drive the #20 migration phase by phase rather than expanding the
toolchain speculatively beyond what each phase needs.

See `.ai_context.md` for hosting identifiers and deploy tooling.
