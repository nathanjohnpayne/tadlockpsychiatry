#!/usr/bin/env node
// scripts/smoke-protected.mjs
//
// One-shot smoke test for dist-protected/direction-{1,2,3}.js after
// the phase-4 mount-function port. Sets up a happy-dom window, imports
// each built module, calls mount(rootEl, { tweaks, practice }) with
// minimal data, and reports any React render errors. This is the
// quickest way to catch the React-instance dispatch failure Codex
// caught on PR #33 without a real browser.
//
// Run: node scripts/smoke-protected.mjs
import { Window } from "happy-dom";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const win = new Window({ url: "http://localhost/" });
// Make happy-dom's window globals visible to React / react-dom.
globalThis.window = win;
globalThis.document = win.document;
globalThis.HTMLElement = win.HTMLElement;
globalThis.Element = win.Element;
globalThis.Node = win.Node;
// Node 21+ has a built-in navigator we can't reassign; happy-dom's
// is fine to skip since react-dom only checks userAgent in some
// dev paths.
globalThis.requestAnimationFrame = win.requestAnimationFrame.bind(win);
globalThis.cancelAnimationFrame = win.cancelAnimationFrame.bind(win);
globalThis.MessageChannel = win.MessageChannel;
globalThis.MutationObserver = win.MutationObserver;

const minimalPractice = {
  name: "Test", shortName: "T", practice: "Test", location: "Test",
  format: "Test", established: "2026", status: "Test",
  heroEyebrow: "Test", heroLeads: ["a", "b", "c"], heroSub: "test",
  positioning: [{ k: "01", h: "h", p: "p" }, { k: "02", h: "h", p: "p" }, { k: "03", h: "h", p: "p" }],
  bio: ["bio"], credentials: [{ era: "e", school: "s", years: "y" }],
  specialties: [
    { n: "01", title: "t", body: "b", tags: ["a"] },
    { n: "02", title: "t", body: "b", tags: ["a"] },
    { n: "03", title: "t", body: "b", tags: ["a"] },
    { n: "04", title: "t", body: "b", tags: ["a"] },
  ],
  process: [
    { n: "I", title: "t", duration: "d", body: "b" },
    { n: "II", title: "t", duration: "d", body: "b" },
    { n: "III", title: "t", duration: "d", body: "b" },
    { n: "IV", title: "t", duration: "d", body: "b" },
  ],
  metrics: [{ v: "1", u: "u", l: "l" }, { v: "2", u: "", l: "l" }, { v: "3", u: "", l: "l" }],
  faqs: [{ q: "q", a: "a" }, { q: "q", a: "a" }, { q: "q", a: "a" }],
  contact: { address: "a", email: "e", site: "s", hours: "h" },
  portrait: "",
};

const errors = [];
const origError = console.error;
console.error = (...args) => {
  errors.push(args.map((a) => (a && a.stack) || String(a)).join(" "));
  origError(...args);
};
process.on("uncaughtException", (err) => errors.push(err.stack || String(err)));

for (const id of ["1", "2", "3"]) {
  const file = resolve(process.cwd(), `dist-protected/direction-${id}.js`);
  const url = pathToFileURL(file).href;
  console.log(`[smoke] importing ${file}`);
  const mod = await import(url);
  if (typeof mod.default !== "function") {
    throw new Error(`direction-${id}.js default is ${typeof mod.default}, expected function`);
  }
  const root = win.document.createElement("div");
  win.document.body.appendChild(root);
  console.log(`[smoke] calling mount for direction-${id}`);
  mod.default(root, { tweaks: { dark: true }, practice: minimalPractice });
  // happy-dom doesn't tick concurrent React; give a beat for effects.
  await new Promise((r) => setTimeout(r, 50));
  const html = root.innerHTML.length;
  console.log(`[smoke] direction-${id} rendered ${html} bytes of HTML`);
  if (html < 500) {
    throw new Error(`direction-${id}.js rendered too little HTML (${html} bytes) — probable React render failure`);
  }
  win.document.body.removeChild(root);
}

if (errors.length > 0) {
  console.error("\n[smoke] FAILED with", errors.length, "console.error call(s):");
  for (const e of errors) console.error("  -", e.split("\n")[0]);
  process.exit(1);
}
console.log("\n[smoke] OK — all three direction modules mount without errors");
