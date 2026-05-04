import { defineConfig } from "vitest/config";

// Vitest config for the public surface (src/) and the protected build
// output (dist-protected/). Uses jsdom for tests that exercise DOM
// APIs (loader, showBootError); pure-logic tests (isAllowed, etc.)
// don't care about the env but jsdom is cheap.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
    globals: false,
  },
  // Vitest 4 hoists poolOptions to the root config. Suite is small —
  // single-thread keeps startup latency low.
  poolOptions: {
    threads: {
      singleThread: true,
    },
  },
});
