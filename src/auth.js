// Firebase Auth + allowlist guard for the invite-only preview.
//
// Two surfaces:
//   - signIn() / openSignInPopup() — used by the gate (/) on button click.
//   - guardOrRedirect() — used at the top of every protected page (/menu,
//     /d/1, /d/2, /d/3) to bounce unauthenticated/unauthorized visitors
//     before any prototype chrome has a chance to flash.
//
// The allowlist is intentionally hard-coded for v1. The intent is
// invitation, not security — there is no real data behind the gate,
// only design previews. README marks moving the list to Firestore +
// a Cloud Function as future hardening.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase Analytics on every page that imports auth.js (which is
// every page in this preview). Wrapped in isSupported() so SSR / non-browser
// environments / browsers without IndexedDB don't throw.
isAnalyticsSupported()
  .then((ok) => { if (ok) getAnalytics(app); })
  .catch(() => {});

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const ALLOWED = new Set([
  "nathan@nathanpayne.com",
  "sterling.tadlock@gmail.com",
]);

export function isAllowed(user) {
  return !!(user && user.email && ALLOWED.has(user.email.toLowerCase()));
}

export { signOut, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult };

// Used by the gate. Tries popup first; on browsers that block popups
// (Safari with strict settings, some embedded webviews), falls back
// to redirect. `auth/popup-closed-by-user` is intentionally NOT in the
// fallback set: closing the popup is an intentional cancel, and
// re-launching as a full-page redirect would steal that cancel signal.
export async function startSignIn() {
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (err) {
    const code = err && err.code;
    const popupBlocked =
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment";
    if (popupBlocked) {
      await signInWithRedirect(auth, provider);
      return null; // page will reload from the IdP
    }
    throw err;
  }
}

// Page-load guard. Call from /menu and /d/N. Resolves with the user
// when allowlisted; otherwise navigates away and never resolves.
export function guardOrRedirect() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.replace("/");
        return;
      }
      if (!isAllowed(user)) {
        try { await signOut(auth); } catch (_) {}
        location.replace("/?denied=1");
        return;
      }
      unsub();
      resolve(user);
    });
  });
}

export async function signOutAndGoHome() {
  try { await signOut(auth); } catch (_) {}
  location.replace("/");
}
