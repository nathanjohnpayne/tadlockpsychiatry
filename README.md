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

The site is hand-rolled static HTML/CSS/JS. To preview locally:

```bash
# From the repo root, serve the current directory
npx http-server . -p 8080
# or
python3 -m http.server 8080
```

Open http://localhost:8080.

## Deploy

```bash
op-firebase-deploy --only hosting
```

See `DEPLOYMENT.md` for the full setup and deploy flow, including
one-time service account configuration.

## Key Files

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `src/firebase-init.js` | Firebase web SDK init (analytics) |
| `firebase.json` | Hosting config |
| `.firebaserc` | Firebase project pointer |
| `AGENTS.md` | Instructions for AI agents |
| `DEPLOYMENT.md` | Build and deployment |
| `CONTRIBUTING.md` | Development workflow |
| `.ai_context.md` | High-level system context |

## Directory Structure

| Directory | Purpose |
|---|---|
| `src/` | Application code |
| `public/` | Static assets |
| `rules/` | Binding repository constraints |
| `specs/` | Intended system behavior |
| `tests/` | Automated validation |
| `scripts/` | Build, CI, and automation tooling |
| `docs/` | Architecture and design documentation |
