// Ambient globals introduced by the runtime Babel-transformed bundles
// from Firebase Storage.
//
// The direction-loader fetches protected/content.jsx and
// protected/direction-{1,2,3}.jsx, transforms each in-browser via
// @babel/standalone, then runs the result in the global scope. The
// transformed code assigns `window.PRACTICE = PRACTICE` and
// `window.D{N} = D{N}`. This file declares those globals so the loader
// can read them under strict TS without `any`.
//
// Phase 4 (#24) replaces the Babel + eval step with a blob-URL
// dynamic import; at that point this file shrinks to just the React/
// ReactDOM UMD globals (which the direction shells still load via
// <script src="https://unpkg.com/...">).

import type { DirectionComponent, Practice } from "./types";

declare global {
  interface Window {
    // Set by protected/content.jsx after the loader Babel-transforms +
    // evals it. Optional because it's undefined until the first
    // loadAndExec call returns.
    PRACTICE?: Practice;
    // Set by protected/direction-{1,2,3}.jsx after the loader
    // Babel-transforms + evals each.
    D1?: DirectionComponent;
    D2?: DirectionComponent;
    D3?: DirectionComponent;
    // @babel/standalone is loaded via a <script src="https://unpkg.com/
    // @babel/standalone..."> in each direction shell. Only the
    // .transform method is used by the loader.
    Babel: {
      transform(
        code: string,
        opts: { presets?: string[]; sourceType?: string },
      ): { code: string };
    };
    // React + ReactDOM UMD globals from the unpkg <script> tags. Only
    // the createElement / createRoot subset is used here; broader use
    // can fall back to the npm-resolved react types in phase 4.
    React: typeof import("react");
    ReactDOM: typeof import("react-dom/client");
  }
}

export {};
