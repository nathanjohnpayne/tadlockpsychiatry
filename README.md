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
`dist/`, which Hosting serves) and then `bash scripts/sync-protected.sh`
(uploading the gated content to Firebase Storage) before any upload.

See `DEPLOYMENT.md` for the full setup and deploy flow, including
one-time service account configuration.

## Key Files

| File | Purpose |
|---|---|
| `index.html` | Gate page (Vite entry) |
| `menu/index.html`, `d/{1,2,3}/index.html` | Other Vite entries |
| `src/firebase-config.js` | Firebase web SDK config (apiKey, projectId, etc.) |
| `src/auth.js` | Auth + allowlist guard + protected-blob fetch |
| `src/direction-loader.js` | Runtime loader for the gated direction prototypes |
| `vite.config.ts` | Multi-page Vite config (externalizes gstatic + unpkg URLs) |
| `firebase.json` | Hosting config (`public: dist`, predeploy build hook) |
| `storage.rules` | Server-side allowlist for the protected/ prefix |
| `.firebaserc` | Firebase project pointer |
| `AGENTS.md` | Instructions for AI agents |
| `DEPLOYMENT.md` | Build and deployment |
| `CONTRIBUTING.md` | Development workflow |
| `.ai_context.md` | High-level system context |

## Directory Structure

| Directory | Purpose |
|---|---|
| `src/` | Application code (auth, firebase config, direction loader) |
| `protected/` | Gated content uploaded to Storage (not bundled into `dist/`) |
| `dist/` | Vite build output (gitignored; what Hosting serves) |
| `rules/` | Binding repository constraints |
| `specs/` | Intended system behavior |
| `tests/` | Automated validation |
| `scripts/` | Build, CI, and automation tooling |
| `docs/` | Architecture and design documentation |
