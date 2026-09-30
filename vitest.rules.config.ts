import { defineConfig } from "vitest/config";

// Vitest config for the Storage rules suite (tests/rules/). Kept separate
// from vitest.config.ts because these tests need the Storage emulator:
// run them through `npm run test:rules`, which wraps vitest in
// `firebase emulators:exec --only storage`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    globals: false,
    fileParallelism: false,
    testTimeout: 20000,
  },
});
