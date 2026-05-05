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
- The migration is in progress per #20. Phases 1 (#21, toolchain),
  2 (#22, TS port + npm-resolved `firebase@^11`), 3 (#23, protected
  sources to TypeScript + esbuild build to `dist-protected/`), and
  4 (#24, loader swapped to blob-URL dynamic import + unpkg
  React/Babel UMD scripts retired) are merged. Public modules:
  `src/auth.ts` / `src/firebase-config.ts` / `src/direction-loader.ts`
  / `src/types.ts`. Protected sources: `protected-src/{content,
  direction-{1,2,3}}.tsx` plus `protected-src/assets/sterling-
  tadlock.png`. Firebase is bundled into the auth chunk. React +
  react-dom are bundled into each protected module via a
  `DirectionMount` function; the direction-loader itself imports no
  React package and is a thin orchestrator (~2.7 kB chunk) — this
  keeps React a single instance per page and avoids cross-instance
  hook-dispatch failures (see Codex P1 on PR #33). The only external
  CDN imports left are the Google Fonts stylesheets. Phases 5–6
  refactor the inline-styled prototypes onto `useViewport()` + a
  theme object and ship #11's responsive refinements.
- Firebase Hosting + Firebase Storage (storage.rules gates
  `protected/`).
- Firebase Analytics (GA4 measurement id `G-R8TK2SVVS0`).

## Agent Role

Maintain the site content, the agent-tooling infrastructure, and the
review-policy workflow. Keep `dist/` and other build artifacts out of
git. Drive the #20 migration phase by phase rather than expanding the
toolchain speculatively beyond what each phase needs.

See `.ai_context.md` for hosting identifiers and deploy tooling.
