// Direction-loader: shared boot for /d/1, /d/2, /d/3.
//
// Each direction page calls bootDirection({ id, tweaks }). This function:
//   1. Runs the auth guard (redirects unauth/unauthorized visitors after
//      a protected Storage metadata probe, before any protected UI is
//      revealed or content module is fetched).
//   2. Pulls protected/content.js from the project's Storage bucket
//      (Storage SDK signs the request with the user's Firebase Auth
//      token; storage.rules enforces the allowlist server-side).
//      Mints a blob URL and dynamic-imports it; reads the default
//      export as the typed Practice object.
//   3. Pulls protected/sterling-tadlock.png the same way, mints an
//      object URL, and overrides practice.portrait so direction
//      components can use <img src={practice.portrait}/> normally.
//   4. Pulls the per-direction module (e.g. protected/direction-1.js),
//      dynamic-imports the same way, reads the default export as the
//      DirectionMount function.
//   5. Calls mount(rootEl, { tweaks, practice }) — the protected
//      module owns the React render path so React + ReactDOM are a
//      single instance per page — and reveals the body.
//
// Why Storage instead of plain `fetch` + Hosting rewrites: see
// storage.rules and the PR-3 body for the org-policy issue that
// blocked the Cloud Function approach. With Storage, the SDK handles
// auth header attachment; we don't have to manage tokens manually.
//
// Phase 4 (#24) of the Vite migration: replaced the Babel-runtime
// indirect-eval path with blob-URL dynamic import. Each protected
// module is an esbuild-bundled, self-contained ES module that owns
// its own React + ReactDOM and exports a mount function — the loader
// hands it a target element + props and the module renders itself.
// This keeps React a single instance per page (loader doesn't import
// react/react-dom at all anymore), avoiding the cross-instance hook
// dispatch failure Codex P1'd before merge.
//
// content.js exports the typed Practice object (no React).
// direction-{1,2,3}.js export DirectionMount functions.
//
// Risk: blob-URL dynamic import has historically been a Safari sharp
// edge. Smoke on iOS Safari before merging — the Chromium-based
// preview server can't catch this. CSP is currently empty in
// firebase.json; if a Cloudflare-injected CSP enforces script-src
// without `blob:`, the blob-URL import fails. No CSP is set today,
// so this works in production as written; if a CSP gets added later,
// the directive needs `script-src 'self' blob:`.
import type { User } from "firebase/auth";
import {
  guardOrRedirect,
  getProtectedBlob,
  signOutAndGoHome,
} from "./auth";
import type { DirectionMount, Practice, Tweaks } from "./types";

// Hard timeout on any single Storage / parse step. If `getBlob()` or
// `import()` ever hangs without throwing (CORS preflight that stalls,
// network promise that never settles, etc.), users would stare at a
// blank page forever — `body { visibility: hidden }` only flips on
// `.ready`, which we add only on success or on the showBootError
// fallback. The timeout converts a hang into a visible error.
const STEP_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${STEP_TIMEOUT_MS}ms`)),
        STEP_TIMEOUT_MS,
      ),
    ),
  ]);
}

// Fetch a built ES module from the protected bucket and dynamic-
// import it via a blob URL. Returns the module's default export
// typed as T.
//
// `URL.revokeObjectURL` runs on a microtask after the import resolves.
// Browsers keep the resolved module alive after revoke, so subsequent
// imports of the same URL would fail — but we always mint a fresh URL
// per call, and the loader only fetches each protected file once per
// direction visit, so this is fine.
async function loadModule<T>(filename: string): Promise<T> {
  console.log(`[direction-loader] fetching protected/${filename}`);
  const blob = await withTimeout(
    getProtectedBlob(filename),
    `protected/${filename} fetch`,
  );
  // Force the blob's MIME type to a JS module type so Safari accepts
  // the dynamic import. Without this, Storage may serve the blob with
  // a generic `application/octet-stream` and Safari refuses to import
  // it via `import()` (Chromium is more permissive).
  const moduleBlob = blob.type.startsWith("text/javascript")
    ? blob
    : blob.slice(0, blob.size, "text/javascript");
  const url = URL.createObjectURL(moduleBlob);
  try {
    // /* @vite-ignore */ — the URL is dynamic at runtime; Vite's
    // build-time analyzer must not try to inline it.
    const mod = (await import(/* @vite-ignore */ url)) as { default: T };
    if (mod.default == null) {
      throw new Error(
        `protected/${filename} did not export a default value`,
      );
    }
    return mod.default;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadAsBlobUrl(filename: string): Promise<string> {
  console.log(`[direction-loader] fetching protected/${filename} as blob`);
  const blob = await withTimeout(
    getProtectedBlob(filename),
    `protected/${filename} fetch`,
  );
  const url = URL.createObjectURL(blob);
  // Revoke on genuine unload. `pagehide` also fires when the page enters
  // the back-forward cache (`event.persisted === true`); revoking then
  // would invalidate the portrait <img> when the user navigates back and
  // the page is restored from bfcache. Skip revoke in that case — the
  // browser keeps the blob alive across the bfcache transition, and a
  // later genuine unload (persisted === false) will revoke. The handler
  // self-removes only on the genuine-unload path so it stays armed
  // across any number of bfcache cycles. CodeRabbit flagged this on #48.
  const onPageHide = (event: PageTransitionEvent) => {
    if (event.persisted) return;
    URL.revokeObjectURL(url);
    window.removeEventListener("pagehide", onPageHide);
  };
  window.addEventListener("pagehide", onPageHide);
  return url;
}

// Populate the preview bar's Signed-in-as field and wire its Sign-out
// link. Mirrors the menu's topbar wiring (menu/index.html). Tolerant
// of the elements being absent — if a future direction shell drops
// the bar, this becomes a no-op.
function wirePreviewBar(user: User): void {
  const who = document.getElementById("who");
  if (who) {
    const email = (user.email ?? "").toLowerCase();
    const local = email.split("@")[0];
    who.textContent = local || user.displayName || email;
  }
  const out = document.getElementById("signout");
  if (out) {
    out.addEventListener("click", (e) => {
      e.preventDefault();
      void signOutAndGoHome();
    });
  }
}

// Render a visible failure state and reveal the body. Without this, a
// failed protected fetch / dynamic import / mount would leave the body
// hidden indefinitely (since `.ready` only gets added on success), and
// the user would stare at a blank page with the answer only in the
// devtools console.
function showBootError(id: string, err: unknown): void {
  const root = document.getElementById("root");
  if (root) {
    root.replaceChildren();
    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "position:fixed",
      "inset:0",
      "display:grid",
      "place-items:center",
      "padding:24px",
      "font-family:'JetBrains Mono', ui-monospace, monospace",
      "font-size:13px",
      "color:#ffffff",
      "mix-blend-mode:difference",
      "text-align:center",
    ].join(";");
    const inner = document.createElement("div");
    const heading = document.createElement("div");
    heading.style.cssText =
      "opacity:0.7; letter-spacing:1.6px; text-transform:uppercase; font-size:10.5px; margin-bottom:14px;";
    heading.textContent = `DIRECTION ${id}—LOAD FAILED`;
    const message = document.createElement("div");
    message.style.cssText = "opacity:0.55; max-width:480px; line-height:1.6;";
    // textContent — never enters HTML parsing, so the err.message can
    // contain any user-uncontrolled string without an XSS risk.
    message.textContent =
      (err as { message?: string } | null)?.message ?? "Unknown error";
    const linkWrap = document.createElement("div");
    linkWrap.style.marginTop = "24px";
    const link = document.createElement("a");
    link.href = "/menu";
    link.style.color = "inherit";
    link.textContent = "← BACK TO MENU";
    linkWrap.appendChild(link);
    inner.append(heading, message, linkWrap);
    wrap.appendChild(inner);
    root.appendChild(wrap);
  }
  document.body.classList.add("ready");
}

export interface BootDirectionArgs {
  id: "1" | "2" | "3";
  tweaks: Tweaks;
}

export async function bootDirection({
  id,
  tweaks,
}: BootDirectionArgs): Promise<void> {
  try {
    // Guard runs first — unauthorized users can only reach the
    // metadata probe in src/auth.ts, not the protected content/module
    // fetches below.
    console.log(`[direction-loader] d/${id}: awaiting auth guard`);
    const user = await withTimeout(guardOrRedirect(), `auth guard for d/${id}`);
    console.log(`[direction-loader] d/${id}: auth guard cleared`);

    // Wire the embedded preview bar: populate "Signed in as <name>"
    // and the Sign-out link. Same shape as the menu's topbar.
    wirePreviewBar(user);

    // Order matters:
    //  - content.js imported first to get the typed Practice object
    //  - then we override portrait with an auth-fetched object URL
    //  - then the direction module is imported and rendered with
    //    `practice` passed as a prop (no globals)
    const practice = await loadModule<Practice>("content.js");
    try {
      practice.portrait = await loadAsBlobUrl("sterling-tadlock.png");
    } catch (err) {
      // Portrait is non-fatal — let the rest of the page render with
      // an empty src. The other content is still useful.
      console.warn(
        "[direction-loader] portrait fetch failed; using empty placeholder",
        err,
      );
      practice.portrait = "";
    }

    const mount = await loadModule<DirectionMount>(`direction-${id}.js`);

    const rootEl = document.getElementById("root");
    if (!rootEl) {
      throw new Error("#root element not found in DOM");
    }
    mount(rootEl, { tweaks, practice });
    document.body.classList.add("ready");
  } catch (err) {
    console.error(`[direction-loader] boot failed for d/${id}`, err);
    showBootError(id, err);
    throw err; // still propagate so the caller's .catch() can also log
  }
}
