// Storage security-rules coverage for storage.rules.
//
// Runs against the Firebase Storage emulator via `npm run test:rules`
// (firebase emulators:exec). Not part of `npm test` because it needs the
// emulator + a Java runtime. Mirrors the two client reads in src/auth.ts:
// getMetadata() on protected/content.js (the access probe) and getBlob()
// on protected/* (content + direction modules + portrait).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { getBytes, getMetadata, ref, uploadBytes } from "firebase/storage";

const PROBE = "protected/content.js";
const ALLOWED = "sterling.tadlock@gmail.com";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const [host, port] = (
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199"
  ).split(":");
  testEnv = await initializeTestEnvironment({
    projectId: process.env.GCLOUD_PROJECT ?? "demo-tadlockpsychiatry",
    storage: {
      host,
      port: Number(port),
      rules: readFileSync(resolve(__dirname, "../../storage.rules"), "utf8"),
    },
  });
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(ctx.storage(), PROBE), new Uint8Array([1, 2, 3]), {
      contentType: "text/javascript",
    });
    await uploadBytes(ref(ctx.storage(), "public/other.txt"), new Uint8Array([1]));
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

const storageFor = (claims: Record<string, unknown> | null) =>
  claims === null
    ? testEnv.unauthenticatedContext().storage()
    : testEnv.authenticatedContext("user", claims).storage();

describe("protected/** read", () => {
  it("allows an allowlisted, verified Google account (metadata probe + blob read)", async () => {
    const storage = storageFor({ email: ALLOWED, email_verified: true });
    await assertSucceeds(getMetadata(ref(storage, PROBE)));
    await assertSucceeds(getBytes(ref(storage, PROBE)));
  });

  it("matches the allowlist case-insensitively", async () => {
    const storage = storageFor({ email: "Nathan@NathanPayne.com", email_verified: true });
    await assertSucceeds(getMetadata(ref(storage, PROBE)));
  });

  it("denies an allowlisted address whose email is not verified", async () => {
    const storage = storageFor({ email: ALLOWED, email_verified: false });
    await assertFails(getMetadata(ref(storage, PROBE)));
    await assertFails(getBytes(ref(storage, PROBE)));
  });

  it("denies an allowlisted address with no email_verified claim", async () => {
    const storage = storageFor({ email: ALLOWED });
    await assertFails(getMetadata(ref(storage, PROBE)));
  });

  it("denies a verified account that is not on the allowlist", async () => {
    const storage = storageFor({ email: "someone@example.com", email_verified: true });
    await assertFails(getMetadata(ref(storage, PROBE)));
  });

  it("denies unauthenticated reads", async () => {
    await assertFails(getMetadata(ref(storageFor(null), PROBE)));
  });

  it("denies writes even for an allowlisted, verified account", async () => {
    const storage = storageFor({ email: ALLOWED, email_verified: true });
    await assertFails(uploadBytes(ref(storage, "protected/new.js"), new Uint8Array([1])));
  });
});

describe("default deny", () => {
  it("denies reads outside protected/ even for an allowlisted account", async () => {
    const storage = storageFor({ email: ALLOWED, email_verified: true });
    await assertFails(getMetadata(ref(storage, "public/other.txt")));
  });
});
