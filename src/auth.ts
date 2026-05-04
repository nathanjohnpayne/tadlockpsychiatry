// Firebase Auth + allowlist guard for the invite-only preview.
//
// Two surfaces:
//   - startSignIn() — used by the gate (/) on button click.
//   - guardOrRedirect() — used at the top of every protected page (/menu,
//     /d/1, /d/2, /d/3) to bounce unauthenticated/unauthorized visitors
//     before any prototype chrome has a chance to flash.
//
// The allowlist is intentionally hard-coded for v1. The intent is
// invitation, not security — there is no real data behind the gate,
// only design previews. Moving the list to Firestore + a Cloud
// Function is future hardening (see README.md).
//
// Phase 2 of the Vite migration: this file moved from src/auth.js (CDN
// imports from https://www.gstatic.com/firebasejs/...) to src/auth.ts
// (npm-resolved firebase 11.x). Vite bundles Firebase into the chunk;
// the gstatic.com host no longer appears as an external import in the
// bundle's import graph. Behavior is otherwise unchanged.
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import {
  getStorage,
  ref as storageRef,
  getBlob,
  type FirebaseStorage,
} from "firebase/storage";
import { firebaseConfig } from "./firebase-config";

export const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase Analytics on every page that imports auth (which
// is every page in this preview). Wrapped in isSupported() so SSR /
// non-browser environments / browsers without IndexedDB don't throw.
isAnalyticsSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {
    // Analytics is non-essential — swallow init errors.
  });

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const ALLOWED = new Set([
  "nathan@nathanpayne.com",
  "sterling.tadlock@gmail.com",
]);

export function isAllowed(user: User | null): boolean {
  return !!(user && user.email && ALLOWED.has(user.email.toLowerCase()));
}

export {
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
};

// Used by the gate. Tries popup first; on browsers that block popups
// (Safari with strict settings, some embedded webviews), falls back
// to redirect. `auth/popup-closed-by-user` is intentionally NOT in the
// fallback set: closing the popup is an intentional cancel, and
// re-launching as a full-page redirect would steal that cancel signal.
export async function startSignIn(): Promise<User | null> {
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
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
export function guardOrRedirect(): Promise<User> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.replace("/");
        return;
      }
      if (!isAllowed(user)) {
        try {
          await signOut(auth);
        } catch {
          // best-effort sign-out before redirect
        }
        location.replace("/?denied=1");
        return;
      }
      unsub();
      resolve(user);
    });
  });
}

export async function signOutAndGoHome(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // best-effort — redirect anyway so the user isn't stranded
  }
  location.replace("/");
}

// Fetch a file from the protected/ prefix of the project's default
// Storage bucket. The Storage SDK signs the request with the current
// user's Firebase Auth token; Storage Rules (storage.rules) enforce the
// allowlist server-side. Returns a Blob.
//
// Used by src/direction-loader.ts to pull /protected/content.jsx,
// /protected/direction-{1,2,3}.jsx, and /protected/sterling-tadlock.png
// for any signed-in allowlisted user. An anonymous fetch from `gsutil
// cp` or a `curl` of the bucket URL returns 403 because the rules
// require an authenticated email on the allowlist.
export async function getProtectedBlob(filename: string): Promise<Blob> {
  return getBlob(storageRef(storage, `protected/${filename}`));
}
