// Firebase web SDK init for tadlockpsychiatry.com.
//
// The apiKey here is a public client identifier — not a secret. Real
// access controls live in Firestore/Storage rules and App Check (when
// enabled). Server-side credentials (deploy auth) are 1Password-backed
// via the standard op-firebase-deploy flow; nothing in this file is
// privileged.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCr_lq5sM5OZpV3g6_sddm8mQNDS63J9IY",
  authDomain: "tadlockpsychiatry.firebaseapp.com",
  projectId: "tadlockpsychiatry",
  storageBucket: "tadlockpsychiatry.firebasestorage.app",
  messagingSenderId: "621650794003",
  appId: "1:621650794003:web:552e74976c74cebb08d1e6",
  measurementId: "G-R8TK2SVVS0",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
