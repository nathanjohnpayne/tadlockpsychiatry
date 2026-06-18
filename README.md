# Tadlock Psychiatry

Marketing/information website for the practice at
[tadlockpsychiatry.com](https://tadlockpsychiatry.com).

Static site hosted on Firebase Hosting with Firebase Analytics. Built from
the AI Agent Tooling Standard template ([Mergepath](https://github.com/nathanjohnpayne/mergepath)).

## For AI Agents

Read these files in order before taking any action:

1. `AGENTS.md` — behavioral instructions and operating rules
2. `rules/repo_rules.md` — binding structural constraints
3. `.ai_context.md` — supplemental system context
4. `DEPLOYMENT.md` — build and deploy

## Code Review Policy

Every change in this repository goes through the policy in
`REVIEW_POLICY.md`, including a self-peer review by the authoring agent's
reviewer identity and, for changes that cross the threshold or touch
protected paths, automated external review via the OpenAI Codex GitHub
app (Phase 4a) or a manual CLI fallback (Phase 4b).

## Local Development

The site is built with Vite (multi-page) — see `vite.config.ts` for the
list of HTML entries (gate `/`, `/menu`, `/d/{1,2,3}`). To preview
locally:

```bash
npm install
npm run dev      # Vite dev server (defaults to http://localhost:5173)
# or
npm run build && npm run preview   # production build served from dist/
```

Note: `vite preview` does not apply Firebase Hosting's `cleanUrls`
rewrite, so multi-page entries need a trailing slash locally
(`/menu/`, `/d/1/`). Hosting rewrites them in production.

## Deploy

```bash
op-firebase-deploy --only hosting
```

`firebase.json`'s `hosting.predeploy` runs `npm run build` (writing
`dist/`, which Hosting serves), then `npm run build:protected` (esbuild
strips TypeScript from `protected-src/*.tsx` into `dist-protected/`),
then `bash scripts/sync-protected.sh` (uploading the built protected
files to Firebase Storage) before any upload.

See `DEPLOYMENT.md` for the full setup and deploy flow, including
one-time service account configuration.

## Key Files

| File | Purpose |
|---|---|
| `index.html` | Gate page (Vite entry) |
| `menu/index.html`, `d/{1,2,3}/index.html` | Other Vite entries |
| `src/firebase-config.ts` | Firebase web SDK config (apiKey, projectId, etc.) |
| `src/auth.ts` | Auth + Storage Rules access probe + protected-blob fetch |
| `src/direction-loader.ts` | Runtime loader for the gated direction prototypes |
| `src/types.ts` | Shared types (`Practice`, `Tweaks`, `DirectionComponent`) — imported by both `src/` and `protected-src/` |
| `protected-src/*.tsx` | Gated React components + content (TypeScript source — NOT bundled into `dist/`) |
| `protected-src/d{1,2,3}/theme.ts` | Per-direction color/font/spacing tokens (phase 5) |
| `protected-src/shared/use-viewport.ts` | `useViewport()` hook + `sectionPadding`/`collapseGridColumns`/`capHeroFontSize` responsive helpers (phase 5) |
| `vite.config.ts` | Multi-page Vite config (externalizes Google Fonts URLs only) |
| `tsconfig.protected.json` | TS project config for `protected-src/` (relaxed strictness for the inline-styled prototypes) |
| `scripts/build-protected.mjs` | esbuild step that bundles `protected-src/*.tsx` (React inlined) into `dist-protected/*.js` ES modules for Storage upload |
| `firebase.json` | Hosting config (`public: dist`, three-step predeploy: build → build:protected → sync) |
| `storage.rules` | Authoritative allowlist for the protected/ prefix |
| `.firebaserc` | Firebase project pointer |
| `AGENTS.md` | Instructions for AI agents |
| `DEPLOYMENT.md` | Build and deployment |
| `CONTRIBUTING.md` | Development workflow |
| `.ai_context.md` | High-level system context |

## Directory Structure

| Directory | Purpose |
|---|---|
| `src/` | Public application code (auth, firebase config, direction loader, types) |
| `protected-src/` | TypeScript source for the gated direction prototypes + content (built into `dist-protected/` by `npm run build:protected`) |
| `dist/` | Vite public build output (gitignored; what Hosting serves) |
| `dist-protected/` | esbuild protected build output (gitignored; uploaded to Firebase Storage by `scripts/sync-protected.sh`) |
| `rules/` | Binding repository constraints |
| `tests/` | Vitest unit tests (`tests/unit/`) + shell-based fixture tests for `scripts/` |
| `scripts/` | Build, CI, and automation tooling |
| `docs/` | Architecture and design documentation |
