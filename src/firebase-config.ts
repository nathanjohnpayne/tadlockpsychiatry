// Firebase web config for tadlockpsychiatry.com.
//
// The apiKey here is a public client identifier — not a secret. Real
// access controls are the Auth allowlist enforced in src/auth.ts plus
// storage.rules and (future) App Check. Server-side credentials (deploy
// auth) are 1Password-backed via op-firebase-deploy.
import type { FirebaseOptions } from "firebase/app";

export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCr_lq5sM5OZpV3g6_sddm8mQNDS63J9IY",
  authDomain: "tadlockpsychiatry.firebaseapp.com",
  projectId: "tadlockpsychiatry",
  storageBucket: "tadlockpsychiatry.firebasestorage.app",
  messagingSenderId: "621650794003",
  appId: "1:621650794003:web:552e74976c74cebb08d1e6",
  measurementId: "G-R8TK2SVVS0",
};
