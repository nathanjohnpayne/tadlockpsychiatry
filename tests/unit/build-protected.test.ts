// Unit tests for the protected build artifact (dist-protected/*.js).
//
// Asserts the runtime contract every direction module + content module
// must hold post-phase-4: ES module shape, default export, no leftover
// window.* globals, no leftover TypeScript syntax, no external CDN
// references. Skips silently if the build hasn't been run — `npm run
// build:protected` produces dist-protected/.
//
// Run order in CI: `npm run build:protected && npm run test`.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const distRoot = resolve(__dirname, "../../dist-protected");
const buildExists = existsSync(distRoot);

const directionFiles = ["direction-1.js", "direction-2.js", "direction-3.js"];

describe.skipIf(!buildExists)("dist-protected contract", () => {
  it("emits all four module files + portrait", () => {
    expect(existsSync(resolve(distRoot, "content.js"))).toBe(true);
    expect(existsSync(resolve(distRoot, "sterling-tadlock.png"))).toBe(true);
    for (const f of directionFiles) {
      expect(existsSync(resolve(distRoot, f))).toBe(true);
    }
  });

  describe("each direction module", () => {
    for (const f of directionFiles) {
      describe(f, () => {
        const src = buildExists
          ? readFileSync(resolve(distRoot, f), "utf8")
          : "";

        it("has a default export", () => {
          // esbuild minified — match either `export{X as default}` or
          // `export default X`.
          expect(src).toMatch(/export\s*\{\s*\w+\s+as\s+default\s*\}|export\s+default\s+/);
        });

        it("has no window.D{N} or window.PRACTICE legacy globals", () => {
          expect(src).not.toMatch(/window\.D[123]\s*=/);
          expect(src).not.toMatch(/window\.PRACTICE\s*=/);
        });

        it("has no @babel/standalone or window.Babel residue", () => {
          expect(src).not.toContain("@babel/standalone");
          expect(src).not.toMatch(/window\.Babel/);
        });

        it("has no leftover TypeScript syntax in the output", () => {
          expect(src).not.toMatch(/^import\s+type\s/m);
          expect(src).not.toMatch(/declare\s+const\s/);
        });

        it("has no http(s) external imports (React + ReactDOM inlined)", () => {
          // Block all three module-import shapes:
          //   - static `from "https://..."` (named / namespace / default)
          //   - side-effect `import "https://..."` (no `from`)
          //   - dynamic `import("https://...")` (with optional whitespace)
          // Internal Firebase analytics URLs that appear as string
          // literals in the bundle don't fall into any of these and so
          // don't trip the assertion.
          expect(src).not.toMatch(/\bfrom\s+['"]https?:\/\//);
          expect(src).not.toMatch(/^\s*import\s+['"]https?:\/\//m);
          expect(src).not.toMatch(/\bimport\s*\(\s*['"]https?:\/\//);
        });

        it("includes a createRoot reference (per the DirectionMount contract proxy)", () => {
          // The mount fn calls createRoot(rootEl).render(...). Bundled
          // react-dom internally references createRoot in setup paths —
          // the user-code call is what we want to count, but minified
          // bundling makes that hard to isolate. As a proxy, just
          // assert createRoot appears at least once (it must, since
          // mount uses it).
          expect(src).toMatch(/createRoot/);
        });
      });
    }
  });

  describe("content.js", () => {
    const src = buildExists
      ? readFileSync(resolve(distRoot, "content.js"), "utf8")
      : "";

    it("has a default export", () => {
      expect(src).toMatch(/export\s*\{\s*\w+\s+as\s+default\s*\}|export\s+default\s+/);
    });

    it("has no window.PRACTICE legacy global", () => {
      expect(src).not.toMatch(/window\.PRACTICE\s*=/);
    });

    it("contains the Practice fields the directions read", () => {
      // Spot-check that the bundled content actually includes the
      // string keys the directions destructure. Catches a malformed
      // build where TypeScript types accidentally got bundled instead
      // of values.
      for (const key of [
        "heroEyebrow",
        "heroSub",
        "positioning",
        "specialties",
        "process",
        "metrics",
        "faqs",
        "contact",
      ]) {
        expect(src).toContain(key);
      }
    });

    it("does not bundle React (content has no JSX)", () => {
      // content.tsx exports a plain object — the build should not pull
      // in React. If it does, the bundle is wastefully large.
      expect(src.length).toBeLessThan(20_000);
    });
  });
});
