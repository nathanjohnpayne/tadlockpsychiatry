# Tests

Automated validation lives here. Tests must not be deleted to force a
build to pass (see `rules/repo_rules.md`).

## Layout

- `tests/unit/` — Vitest unit tests (`*.test.ts`). Run with
  `npm test` (single pass) or `npm run test:watch` (watch mode).
  Vitest config: `vitest.config.ts` at repo root, jsdom env.
- `tests/fixtures/` — shell-based fixture scripts exercised by
  `scripts/ci/*` (separate from the Vitest suite).

## Current Tests

- `tests/unit/auth.test.ts` — Storage-backed access-probe semantics
  (null-user, server-side denial, non-policy probe failures, protected
  blob pathing).
- `tests/unit/build-protected.test.ts` — contract checks on the
  `dist-protected/` build artifact: ES module shape, default exports,
  no leftover `window.PRACTICE` / `window.D{N}` / `@babel/standalone`
  globals, no leftover TypeScript syntax, no http(s) external imports
  (React + ReactDOM inlined). The `pretest` script in `package.json`
  runs `npm run build:protected` before every `npm test`, so the
  build artifact is always current and the suite can't silently skip
  via `describe.skipIf`. CI is not yet wired to run `npm test`; that
  is a follow-up.

## Adding a test

Add a `*.test.ts` file under `tests/unit/`. Use Vitest's
`describe`/`it`/`expect` from `"vitest"` (no globals; the config sets
`globals: false`). Mock external SDKs with `vi.mock()` at the top of
the file before importing the system-under-test.

For tests that need to assert on browser behavior beyond what
jsdom + Vitest cover, use the existing `scripts/smoke-protected.mjs`
(happy-dom Node harness) or open a Hosting preview channel and run
the manual smoke documented in #34.
