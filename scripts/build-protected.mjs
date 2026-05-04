#!/usr/bin/env node
// scripts/build-protected.mjs
//
// Phase 3 (#23) of the Vite migration. Strips TypeScript types from
// protected-src/*.tsx and emits dist-protected/*.jsx — the existing
// runtime Babel-transformed loader (src/direction-loader.ts) fetches
// these .jsx files from Firebase Storage and indirect-evals them.
// JSX stays as JSX so Babel's react preset handles it at runtime
// (per the long-standing contract); only the TS syntax is removed.
//
// Phase 4 (#24) replaces this output shape with bundled ES modules
// at .js extensions and switches the loader to a blob-URL dynamic
// import. At that point this file changes its loader option set;
// the build hook in firebase.json stays the same.
//
// Also copies the protected portrait PNG into dist-protected/ so
// scripts/sync-protected.sh has a single source root to upload.
//
// Usage:
//   node scripts/build-protected.mjs
//   npm run build:protected
import { build } from "esbuild";
import { mkdirSync, copyFileSync, readdirSync, rmSync } from "node:fs";
import { resolve, basename } from "node:path";

const root = process.cwd();
const srcDir = resolve(root, "protected-src");
const outDir = resolve(root, "dist-protected");

// Wipe + recreate to mirror the source-of-truth without leaving
// stale files behind (matches Vite's emptyOutDir semantics).
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const tsxEntries = readdirSync(srcDir).filter((f) => f.endsWith(".tsx"));

await build({
  entryPoints: tsxEntries.map((f) => resolve(srcDir, f)),
  outdir: outDir,
  // Per-entry single-file output (no chunking) so each .tsx maps to
  // exactly one output file, with the same basename. Matches the
  // protected/*.jsx → bucket/protected/*.jsx contract today.
  bundle: false,
  // jsx: "preserve" keeps <Foo /> as JSX in the output so the runtime
  // Babel.transform({ presets: ["react"] }) call in the loader can
  // do its job unchanged. format: "esm" keeps ES module syntax for
  // phase 4's dynamic-import swap, but since we're emitting .jsx not
  // .js the loader still treats it as a script today.
  loader: { ".tsx": "tsx" },
  jsx: "preserve",
  outExtension: { ".js": ".jsx" },
  format: "esm",
  // Don't touch console / source URLs — keep stack traces close to
  // the source line numbers so the loader's showBootError diagnostics
  // remain useful.
  sourcemap: false,
  logLevel: "info",
});

// Copy protected static assets (currently just the portrait PNG)
// from protected-src/assets/ to dist-protected/.
const assetsDir = resolve(srcDir, "assets");
try {
  for (const f of readdirSync(assetsDir)) {
    copyFileSync(resolve(assetsDir, f), resolve(outDir, basename(f)));
  }
} catch (err) {
  if ((err && /** @type {{ code?: string }} */ (err).code) !== "ENOENT") throw err;
  console.warn("[build-protected] no assets dir; skipping");
}
