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

export async function bootDirection({ id, tweaks }) {
  if (!["1", "2", "3"].includes(String(id))) {
    throw new Error(`bootDirection: invalid id ${id}`);
  }
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
}
