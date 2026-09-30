# Testing Requirements

- Update tests when behavior changes.
- Do not delete tests to make a build pass.
- Every spec file should have a corresponding test file or a documented
  exception explaining why one does not exist.

## Project-specific

- `npm test` — Vitest unit suite (`tests/unit/`), including the hosting-header and no-analytics guards.
- `npm run test:rules` — Storage security-rules suite (`tests/rules/`) against the Firebase Storage emulator. Every `storage.rules` change needs a deny case for what it blocks and an allow case for the legitimate client reads (the `getMetadata` probe and the `getBlob` media download in `src/auth.ts`; the Node suite exercises the download with `getBytes`, which issues the same request, because `getBlob` is browser-only). Needs the Firebase CLI and a Java runtime.
