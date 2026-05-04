// Direction-loader: shared boot for /d/1, /d/2, /d/3.
//
// Each direction page calls bootDirection({ id, tweaks }). This function:
//   1. Runs the auth guard (redirects unauth/unallowlisted before any
//      protected fetch).
//   2. Pulls protected/content.jsx from the project's Storage bucket
//      (Storage SDK signs the request with the user's Firebase Auth
//      token; storage.rules enforces the allowlist server-side).
//      Babel-transforms the JSX and indirect-evals it so
//      `window.PRACTICE = PRACTICE` lands in the global scope.
//   3. Pulls protected/sterling-tadlock.png the same way, mints an
//      object URL, and overrides window.PRACTICE.portrait so direction
//      components can use <img src={P.portrait}/> normally.
//   4. Pulls the per-direction JSX (e.g. protected/direction-1.jsx),
//      transforms, evals (defines window.D{id}).
//   5. Mounts the React component into #root and reveals the body.
//
// Why Storage instead of plain `fetch` + Hosting rewrites: see
// storage.rules and the PR-3 body for the org-policy issue that
// blocked the Cloud Function approach. With Storage, the SDK handles
// auth header attachment; we don't have to manage tokens manually.
//
// Phase 2 (#22) of the Vite migration: ported from src/direction-
// loader.js to TS, kept the Babel + indirect-eval implementation
// intact. Phase 4 (#24) replaces the Babel runtime with a blob-URL
// dynamic import; this file shrinks substantially then.
import type { User } from "firebase/auth";
import {
  guardOrRedirect,
  getProtectedBlob,
  signOutAndGoHome,
} from "./auth";
import type { DirectionComponent, Tweaks } from "./types";

// Hard timeout on any single Storage / parse step. If `getBlob()` or
// `Babel.transform` ever hangs without throwing (CORS preflight that
// stalls, network promise that never settles, etc.), users would
// stare at a blank page forever — `body { visibility: hidden }` only
// flips on `.ready`, which we add only on success or on the
// showBootError fallback. The timeout converts a hang into a visible
// error.
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

async function loadAndExec(filename: string): Promise<void> {
  console.log(`[direction-loader] fetching protected/${filename}`);
  const blob = await withTimeout(
    getProtectedBlob(filename),
    `protected/${filename} fetch`,
  );
  const code = await blob.text();
  // @babel/standalone exposes Babel.transform synchronously. The 'react'
  // preset handles JSX; we don't need 'env' because the source already
  // targets modern browsers.
  const { code: compiled } = window.Babel.transform(code, {
    presets: ["react"],
    sourceType: "script",
  });
  if (compiled == null) {
    // Babel.transform returns { code: string | null }; null means it
    // parsed the input but emitted nothing (uncommon for our JSX
    // files). Treat as fatal — eval'ing null would silently no-op
    // and the next step (window.PRACTICE / window.D{id} lookup)
    // would throw a less informative error.
    throw new Error(`Babel emitted no code for protected/${filename}`);
  }
  // Indirect eval runs in the global scope, so `window.PRACTICE = ...`
  // and `window.D1 = ...` assignments at the bottom of each protected
  // file land where the mount step expects them.
  (0, eval)(compiled);
}

async function loadAsBlobUrl(filename: string): Promise<string> {
  console.log(`[direction-loader] fetching protected/${filename} as blob`);
  const blob = await withTimeout(
    getProtectedBlob(filename),
    `protected/${filename} fetch`,
  );
  return URL.createObjectURL(blob);
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
// failed protected fetch / Babel transform / mount would leave the body
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
    // Guard runs first — unauthorized users never trigger any protected
    // Storage request, so we never see a 403 in the console for the
    // expected case.
    console.log(`[direction-loader] d/${id}: awaiting auth guard`);
    const user = await withTimeout(guardOrRedirect(), `auth guard for d/${id}`);
    console.log(`[direction-loader] d/${id}: auth guard cleared`);

    // Wire the embedded preview bar: populate "Signed in as <name>"
    // and the Sign-out link. Same shape as the menu's topbar.
    wirePreviewBar(user);

    // Order matters:
    //  - content.jsx defines window.PRACTICE first
    //  - then we override portrait with an auth-fetched object URL
    //  - then the direction file references window.PRACTICE inside its
    //    React component closures
    await loadAndExec("content.jsx");
    if (window.PRACTICE) {
      try {
        window.PRACTICE.portrait = await loadAsBlobUrl("sterling-tadlock.png");
      } catch (err) {
        // Portrait is non-fatal — let the rest of the page render with
        // an empty src. The other content is still useful.
        console.warn(
          "[direction-loader] portrait fetch failed; using empty placeholder",
          err,
        );
        window.PRACTICE.portrait = "";
      }
    }
    await loadAndExec(`direction-${id}.jsx`);

    const Component = window[`D${id}` as "D1" | "D2" | "D3"] as
      | DirectionComponent
      | undefined;
    if (!Component) {
      throw new Error(
        `window.D${id} not defined after loading direction-${id}.jsx`,
      );
    }
    const rootEl = document.getElementById("root");
    if (!rootEl) {
      throw new Error("#root element not found in DOM");
    }
    window.ReactDOM.createRoot(rootEl).render(
      window.React.createElement(Component, { tweaks }),
    );
    document.body.classList.add("ready");
  } catch (err) {
    console.error(`[direction-loader] boot failed for d/${id}`, err);
    showBootError(id, err);
    throw err; // still propagate so the caller's .catch() can also log
  }
}
