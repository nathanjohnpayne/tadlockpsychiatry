// Unit tests for src/auth.ts.
//
// Mocks the firebase/* SDK modules so importing src/auth.ts doesn't
// hit network or real Firebase init. The tests focus on
// hasProtectedAccess(), which is the browser-bundle contract that keeps
// the allowlist in Firebase Storage Rules instead of TypeScript.
import { beforeEach, describe, it, expect, vi } from "vitest";

const firebase = vi.hoisted(() => {
  const app = {};
  const auth = {};
  const storage = {};
  return {
    app,
    auth,
    storage,
    initializeApp: vi.fn(() => app),
    getAuth: vi.fn(() => auth),
    getStorage: vi.fn(() => storage),
    storageRef: vi.fn((_storage: unknown, path: string) => ({ path })),
    getBlob: vi.fn(),
    getMetadata: vi.fn(),
  };
});

vi.mock("firebase/app", () => ({
  initializeApp: firebase.initializeApp,
}));
vi.mock("firebase/auth", () => ({
  getAuth: firebase.getAuth,
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
  getStorage: firebase.getStorage,
  ref: firebase.storageRef,
  getBlob: firebase.getBlob,
  getMetadata: firebase.getMetadata,
}));

const { getProtectedBlob, hasProtectedAccess } = await import("../../src/auth");

beforeEach(() => {
  firebase.storageRef.mockClear();
  firebase.getBlob.mockReset();
  firebase.getMetadata.mockReset();
  firebase.getBlob.mockResolvedValue(new Blob(["ok"]));
  firebase.getMetadata.mockResolvedValue({ path: "protected/content.js" });
});

describe("hasProtectedAccess", () => {
  it("rejects a null user without probing Storage", async () => {
    await expect(hasProtectedAccess(null)).resolves.toBe(false);

    expect(firebase.storageRef).not.toHaveBeenCalled();
    expect(firebase.getMetadata).not.toHaveBeenCalled();
  });

  it("allows a signed-in user when the protected probe is readable", async () => {
    await expect(hasProtectedAccess({ uid: "user-1" } as never)).resolves.toBe(true);

    expect(firebase.storageRef).toHaveBeenCalledWith(
      firebase.storage,
      "protected/content.js",
    );
    expect(firebase.getMetadata).toHaveBeenCalledWith({
      path: "protected/content.js",
    });
  });

  it("denies a signed-in user when Storage Rules reject the probe", async () => {
    firebase.getMetadata.mockRejectedValueOnce(
      Object.assign(new Error("denied"), { code: "storage/unauthorized" }),
    );

    await expect(hasProtectedAccess({ uid: "user-2" } as never)).resolves.toBe(false);
  });

  it("denies a signed-in user when Storage sees no auth token", async () => {
    firebase.getMetadata.mockRejectedValueOnce(
      Object.assign(new Error("unauthenticated"), {
        code: "storage/unauthenticated",
      }),
    );

    await expect(hasProtectedAccess({ uid: "user-3" } as never)).resolves.toBe(false);
  });

  it("surfaces non-policy probe failures", async () => {
    firebase.getMetadata.mockRejectedValueOnce(
      Object.assign(new Error("missing probe"), {
        code: "storage/object-not-found",
      }),
    );

    await expect(hasProtectedAccess({ uid: "user-4" } as never)).rejects.toMatchObject({
      code: "storage/object-not-found",
    });
  });
});

describe("getProtectedBlob", () => {
  it("fetches blobs from the protected prefix", async () => {
    const blob = new Blob(["protected"]);
    firebase.getBlob.mockResolvedValueOnce(blob);

    await expect(getProtectedBlob("asset.js")).resolves.toBe(blob);

    expect(firebase.storageRef).toHaveBeenCalledWith(
      firebase.storage,
      "protected/asset.js",
    );
    expect(firebase.getBlob).toHaveBeenCalledWith({ path: "protected/asset.js" });
  });
});
