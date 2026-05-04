#!/usr/bin/env node
// scripts/build-protected.mjs
//
// Phase 4 (#24) of the Vite migration. Bundles each source file in
// protected-src/ into a self-contained ES module with React inlined,
// emits dist-protected/*.js. The runtime loader (src/direction-
// loader.ts) fetches each file from Firebase Storage as a Blob, mints
// a blob URL, and dynamic-imports it — `(await import(url)).default`
// is either the Practice object (for content.js) or the React
// component (for direction-{1,2,3}.js). The legacy Babel-runtime
// indirect-eval contract is gone.
//
// Bundle/format notes:
//   - bundle: true so React + react/jsx-runtime are inlined per file.
//     Cost: ~140KB raw / ~50KB gzip per direction module. Acceptable
//     because each module is loaded once per direction visit.
//   - format: "esm" so the output is a real ES module the browser's
//     dynamic import can consume.
//   - jsx: "automatic" + jsxDev: false so esbuild emits the modern
//     react/jsx-runtime calls (no `import React` needed in source —
//     but the source files still import React explicitly today, which
//     is harmless: jsx-runtime handles JSX, the React import covers
//     hooks).
//   - target: "es2022" matches tsconfig + the browser baseline the
//     gate / menu / direction shells already require.
//   - minify: true strips whitespace + does dead-code elimination so
//     the React bundle inside each direction module is the production
//     build, not the dev build.
//
// Also copies protected-src/assets/* into dist-protected/.
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
  bundle: true,
  format: "esm",
  loader: { ".tsx": "tsx" },
  jsx: "automatic",
  jsxDev: false,
  target: "es2022",
  minify: true,
  // Per-entry single-file output: each source produces one self-
  // contained module with React inlined. No code-splitting because
  // the runtime loader fetches each module independently from
  // Storage; sharing a chunk between modules would need a second
  // fetch + Storage rule + cross-module URL rewrite. Triplicated
  // React (~150KB raw / 50KB gzip per direction) is the simpler
  // tradeoff today and is loaded once per direction visit.
  splitting: false,
  sourcemap: false,
  // Define NODE_ENV so React's bundle picks the production build
  // (skips the dev-only invariant warnings, ~2× smaller).
  define: { "process.env.NODE_ENV": '"production"' },
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
