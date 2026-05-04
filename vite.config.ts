import { defineConfig } from "vite";
import { resolve } from "node:path";

// Phase 1 of the Vite + TS migration (#20 / #21). The goal here is to
// stand up the toolchain WITHOUT changing runtime behavior. Source files
// in src/ stay JavaScript and continue to import the Firebase SDK from
// gstatic.com URLs as they do today; we mark those URLs external so
// Rollup does not try to resolve and bundle them. Phase 2 will port
// src/* to TypeScript and switch to npm-resolved firebase imports.
//
// Note: @vitejs/plugin-react is in devDependencies but NOT wired into
// the plugins array yet. There is no .tsx/.jsx source under src/ in
// phase 1 to transform, and the protected/*.jsx files are gitignored
// from dist/ (uploaded to Firebase Storage and Babel-transformed at
// runtime). The plugin gets wired up in phase 2 (#22) when src/* gets
// ported to TS, and again in phase 3 (#23) when protected-src/*.tsx
// is bundled by a second Vite config.
//
// Multi-page mode: the gate (/), /menu, and the three direction shells
// (/d/1, /d/2, /d/3) are each their own HTML entry. Vite emits each as
// its own chunk graph in dist/ at the same URL paths.
//
// `cleanUrls: true` in firebase.json strips trailing `/index.html`, so
// users hit /menu and Firebase Hosting serves /menu/index.html.

export default defineConfig({
  appType: "mpa",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        gate: resolve(__dirname, "index.html"),
        menu: resolve(__dirname, "menu/index.html"),
        d1: resolve(__dirname, "d/1/index.html"),
        d2: resolve(__dirname, "d/2/index.html"),
        d3: resolve(__dirname, "d/3/index.html"),
      },
      external: (id) => /^https?:\/\//.test(id),
    },
  },
});
