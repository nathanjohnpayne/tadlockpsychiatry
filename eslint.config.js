// eslint.config.js
//
// Auto-generated from nathanjohnpayne/mergepath's templated source
// at examples/eslint.config.js (per the Mergepath ESLint standard,
// mergepath#250). Edit upstream, not this rendered copy — local
// edits will be overwritten on the next propagation run.
//

import js from "@eslint/js";
import globals from "globals";

import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Ignore generated / vendored output. Customize per-consumer via
  // a follow-up commit on the propagation PR if a repo needs extras
  // (e.g., functions/lib for cloud-functions repos).
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".astro/**",
      ".next/**",
      ".vercel/**",
      // CONSUMER-LOCAL: tadlock's protected build assembles minified
      // bundles into dist-protected/ via `npm run build:protected`
      // (esbuild → dist-protected/*.js). Same rationale as the
      // template's dist/ ignore: build artifacts, not source; linting
      // them produces thousands of false positives on the minified
      // output (no-unused-expressions, no-prototype-builtins, etc.).
      // The mergepath template covers the common dist/ default;
      // per-repo overrides land here.
      "dist-protected/**",
    ],
  },

  // Baseline JS recommended — required by the Mergepath policy floor.
  js.configs.recommended,

  // Apply browser + node globals to all JS sources by default. Narrow
  // these per-file-pattern in a follow-up commit if the repo has a
  // clean split (e.g., scripts/* node-only, src/* browser-only).
  //
  // `*.cjs` files are split out so ESLint parses them as CommonJS
  // (`sourceType: "commonjs"`) rather than ES modules — otherwise
  // top-level `require`/`module.exports` and CommonJS scope rules
  // produce false-positive parse errors. The defaults ESLint applies
  // by extension are: `module` for `.js`/`.mjs`, `commonjs` for
  // `.cjs`; we make that explicit here so the policy is
  // self-documenting.
  {
    files: ["**/*.{js,mjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript recommended ruleset — applied to .ts / .tsx via the
  // typescript-eslint plugin's flat-config preset. Includes the
  // parser, the recommended rule set, and the file-glob targeting.
  ...tseslint.configs.recommended,


  // React + React Hooks recommended rulesets — applied to .jsx / .tsx.
  // Detect the React version automatically from package.json. The
  // React 17+ JSX transform makes `react/react-in-jsx-scope` obsolete;
  // turn it off explicitly so the rule doesn't flag every component.
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // CONSUMER-LOCAL POLICY — TS + React-rule overrides. MUST be LAST.
  //
  // Same template policy as dpr#83 / ffb#274:
  // - `react/prop-types`: off — modern React + TS, type-safety via
  //   tsc not propTypes
  // - `react/no-unescaped-entities`: cosmetic noise
  // - `@typescript-eslint/no-unused-vars`: standard `_`-prefix
  //   ignore convention
  // - `@typescript-eslint/no-explicit-any`: demoted to warn — the
  //   protected-src/direction-*.tsx files are exploratory design
  //   alternatives with intentional `any` for WIP code. Surfacing
  //   them as warnings keeps the signal without failing the build.
  //   TODO: revisit when a design direction is chosen and the
  //   non-selected directions are removed.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // CONSUMER-LOCAL: protected-src/direction-*.tsx are exploratory
  // design alternatives — palette destructuring patterns
  // (`({ fg, bg, faint, dim, card, mouse, inv, accent }) => ...`)
  // intentionally destructure the full palette but each variant
  // uses only a subset. 40+ sites across 3 files; the `^_`-prefix
  // convention would force renaming at every callsite for code
  // that may be removed entirely once a direction is selected.
  // Demoting unused-vars to warn here surfaces the signal without
  // blocking. TODO: tighten when a direction is chosen and the
  // non-selected files are removed.
  {
    files: ["protected-src/direction-*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
