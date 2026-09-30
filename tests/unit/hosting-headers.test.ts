// Guards for the Firebase Hosting headers in firebase.json.
//
// 1. Cache-Control: hashed /assets/** are immutable; HTML documents
//    (served at clean, extensionless URLs because of cleanUrls: true)
//    must revalidate so a deploy never strands a page pointing at hashed
//    assets that no longer exist.
// 2. Content-Security-Policy(-Report-Only): every classic inline
//    <script> in the HTML entries must be allowed by a sha256 hash in
//    script-src. Vite copies these scripts into dist/ byte-for-byte, so
//    hashing the source files matches what Hosting serves. If you edit
//    an inline script, update the hash in firebase.json (this test
//    prints the expected value).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type HeaderRule = {
  source?: string;
  regex?: string;
  headers: { key: string; value: string }[];
};

const root = resolve(__dirname, "../..");
const firebase = JSON.parse(readFileSync(resolve(root, "firebase.json"), "utf8"));
const rules: HeaderRule[] = firebase.hosting.headers;

const headerFor = (rule: HeaderRule | undefined, key: string) =>
  rule?.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;

describe("Cache-Control", () => {
  it("marks hashed /assets/** as immutable for a year", () => {
    const rule = rules.find((r) => r.source === "/assets/**");
    expect(headerFor(rule, "Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("revalidates extensionless (clean URL) documents", () => {
    const rule = rules.find((r) => r.regex !== undefined);
    expect(headerFor(rule, "Cache-Control")).toBe("no-cache");
    const re = new RegExp(rule!.regex!);
    for (const path of ["/", "/menu", "/d/1", "/d/2", "/d/3"]) {
      expect(re.test(path), path).toBe(true);
    }
    for (const path of ["/assets/auth-abc123.js", "/menu/index.html"]) {
      expect(re.test(path), path).toBe(false);
    }
  });

  it("revalidates explicit .html requests", () => {
    const rule = rules.find((r) => r.source === "**/*.html");
    expect(headerFor(rule, "Cache-Control")).toBe("no-cache");
  });

  it("has no other rule setting Cache-Control on /assets or documents", () => {
    const setters = rules.filter((r) => headerFor(r, "Cache-Control") !== undefined);
    expect(setters.map((r) => r.source ?? r.regex).sort()).toEqual(
      ["**/*.html", "/assets/**", "^[^.]*$"].sort(),
    );
  });
});

describe("Content-Security-Policy", () => {
  const global = rules.find((r) => r.source === "**");
  const csp =
    headerFor(global, "Content-Security-Policy") ??
    headerFor(global, "Content-Security-Policy-Report-Only");
  const directives = new Map(
    (csp ?? "")
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .filter((parts) => parts[0])
      .map(([name, ...values]) => [name, values] as const),
  );

  it("is present on every response", () => {
    expect(csp).toBeTruthy();
  });

  it("locks down plugins, base URI and framing", () => {
    expect(directives.get("object-src")).toEqual(["'none'"]);
    expect(directives.get("base-uri")).toEqual(["'self'"]);
    expect(directives.get("frame-ancestors")).toEqual(["'self'"]);
  });

  it("allows blob: module imports for the protected direction loader", () => {
    expect(directives.get("script-src")).toContain("blob:");
    expect(directives.get("img-src")).toContain("blob:");
  });

  it("does not fall back to 'unsafe-inline' or 'unsafe-eval' for scripts", () => {
    expect(directives.get("script-src")).not.toContain("'unsafe-inline'");
    expect(directives.get("script-src")).not.toContain("'unsafe-eval'");
  });

  const entries = [
    "index.html",
    "menu/index.html",
    "d/1/index.html",
    "d/2/index.html",
    "d/3/index.html",
  ];
  for (const entry of entries) {
    it(`allows every classic inline script in ${entry} by hash`, () => {
      const html = readFileSync(resolve(root, entry), "utf8");
      const scriptSrc = directives.get("script-src") ?? [];
      const re = /<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi;
      let m: RegExpExecArray | null;
      let inlineCount = 0;
      while ((m = re.exec(html))) {
        const attrs = m[1] ?? "";
        // External scripts are covered by 'self'; inline module scripts
        // are bundled by Vite into /assets and never ship inline.
        if (/\bsrc=/i.test(attrs) || /type=["']module["']/i.test(attrs)) continue;
        inlineCount++;
        const hash = `'sha256-${createHash("sha256").update(m[2], "utf8").digest("base64")}'`;
        expect(scriptSrc, `${entry} inline script needs ${hash}`).toContain(hash);
      }
      expect(inlineCount).toBeGreaterThan(0);
    });
  }
});

describe("Permissions-Policy", () => {
  it("disables powerful features the site does not use", () => {
    const value = headerFor(rules.find((r) => r.source === "**"), "Permissions-Policy");
    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) {
      expect(value).toContain(`${feature}=()`);
    }
  });
});
