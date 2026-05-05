// Unit tests for src/auth.ts.
//
// Mocks the firebase/* SDK modules so importing src/auth.ts doesn't
// hit network or real Firebase init. The tests focus on isAllowed,
// which is the only piece of pure business logic in the module —
// startSignIn / guardOrRedirect / signOutAndGoHome / getProtectedBlob
// are thin SDK wrappers whose value is integration testing in
// scripts/smoke-protected.mjs (loader path) or future E2E.
import { describe, it, expect, vi } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(function () {
    this.setCustomParameters = vi.fn();
  }),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));
vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  getBlob: vi.fn(),
}));

const { isAllowed } = await import("../../src/auth");

describe("isAllowed", () => {
  it("accepts an allowlisted email", () => {
    expect(isAllowed({ email: "nathan@nathanpayne.com" } as never)).toBe(true);
    expect(isAllowed({ email: "sterling.tadlock@gmail.com" } as never)).toBe(true);
  });

  it("is case-insensitive on the email", () => {
    expect(isAllowed({ email: "NATHAN@nathanpayne.com" } as never)).toBe(true);
    expect(isAllowed({ email: "Sterling.Tadlock@Gmail.COM" } as never)).toBe(true);
  });

  it("rejects an unallowlisted email", () => {
    expect(isAllowed({ email: "someone@example.com" } as never)).toBe(false);
  });

  it("rejects a null user", () => {
    expect(isAllowed(null)).toBe(false);
  });

  it("rejects a user with no email", () => {
    expect(isAllowed({ email: null } as never)).toBe(false);
    expect(isAllowed({} as never)).toBe(false);
  });
});
