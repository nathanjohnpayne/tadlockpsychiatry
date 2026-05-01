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
import { guardOrRedirect, getProtectedBlob } from "/src/auth.js";

async function loadAndExec(filename) {
  const blob = await getProtectedBlob(filename);
  const code = await blob.text();
  // @babel/standalone exposes Babel.transform synchronously. The 'react'
  // preset handles JSX; we don't need 'env' because the source already
  // targets modern browsers.
  const { code: compiled } = window.Babel.transform(code, {
    presets: ["react"],
    sourceType: "script",
  });
  // Indirect eval runs in the global scope, so `window.PRACTICE = ...`
  // and `window.D1 = ...` assignments at the bottom of each protected
  // file land where the mount step expects them.
  (0, eval)(compiled);
}

async function loadAsBlobUrl(filename) {
  const blob = await getProtectedBlob(filename);
  return URL.createObjectURL(blob);
}

// Render a visible failure state and reveal the body. Without this, a
// failed protected fetch / Babel transform / mount would leave the body
// hidden indefinitely (since `.ready` only gets added on success), and
// the user would stare at a blank page with the answer only in the
// devtools console.
function showBootError(id, err) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "position:fixed", "inset:0", "display:grid", "place-items:center",
      "padding:24px", "font-family:'JetBrains Mono', ui-monospace, monospace",
      "font-size:13px", "color:#ffffff", "mix-blend-mode:difference",
      "text-align:center",
    ].join(";");
    wrap.innerHTML =
      `<div>` +
      `<div style="opacity:0.7; letter-spacing:1.6px; text-transform:uppercase; font-size:10.5px; margin-bottom:14px;">DIRECTION ${id} — LOAD FAILED</div>` +
      `<div style="opacity:0.55; max-width:480px; line-height:1.6;">${(err && err.message) ? String(err.message).replace(/[<>&]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])) : "Unknown error"}</div>` +
      `<div style="margin-top:24px;"><a href="/menu" style="color:inherit;">← BACK TO MENU</a></div>` +
      `</div>`;
    root.appendChild(wrap);
  }
  document.body.classList.add("ready");
}

export async function bootDirection({ id, tweaks }) {
  if (!["1", "2", "3"].includes(String(id))) {
    throw new Error(`bootDirection: invalid id ${id}`);
  }
  try {
    // Guard runs first — unauthorized users never trigger any protected
    // Storage request, so we never see a 403 in the console for the
    // expected case.
    await guardOrRedirect();

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
        console.warn("[direction-loader] portrait fetch failed; using empty placeholder", err);
        window.PRACTICE.portrait = "";
      }
    }
    await loadAndExec(`direction-${id}.jsx`);

    const Component = window[`D${id}`];
    if (!Component) {
      throw new Error(`window.D${id} not defined after loading direction-${id}.jsx`);
    }
    window.ReactDOM.createRoot(document.getElementById("root")).render(
      window.React.createElement(Component, { tweaks })
    );
    document.body.classList.add("ready");
  } catch (err) {
    console.error(`[direction-loader] boot failed for d/${id}`, err);
    showBootError(id, err);
    throw err; // still propagate so the caller's .catch() can also log
  }
}
