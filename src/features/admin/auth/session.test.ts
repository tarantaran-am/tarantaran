import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { SESSION_MAX_AGE_SECONDS, createSessionToken, isValidSessionToken } from "./session";

const SECRET = "a".repeat(32);

describe("session token", () => {
  it("accepts a token it signed until it expires", () => {
    const now = Date.now();
    const token = createSessionToken(SECRET, now);
    expect(isValidSessionToken(token, SECRET, now + 1000)).toBe(true);
    expect(isValidSessionToken(token, SECRET, now + SESSION_MAX_AGE_SECONDS * 1000 + 1)).toBe(false);
  });

  it("rejects tampered, foreign and missing tokens", () => {
    const token = createSessionToken(SECRET);
    const [expiresAt, signature] = token.split(".");
    expect(isValidSessionToken(`${Number(expiresAt) + 1}.${signature}`, SECRET)).toBe(false);
    expect(isValidSessionToken(token, "b".repeat(32))).toBe(false);
    expect(isValidSessionToken(undefined, SECRET)).toBe(false);
    expect(isValidSessionToken("garbage", SECRET)).toBe(false);
  });
});

describe("password hash", () => {
  it("verifies the right password only", async () => {
    const stored = await hashPassword("correct horse");
    expect(stored).not.toContain("$");
    expect(await verifyPassword("correct horse", stored)).toBe(true);
    expect(await verifyPassword("wrong horse", stored)).toBe(false);
    expect(await verifyPassword("correct horse", "not-a-hash")).toBe(false);
  });
});
