import { describe, expect, it } from "vitest";
import { isSessionCookieName } from "./auth-cookie";

describe("isSessionCookieName", () => {
  it("matches the session cookie and its chunks", () => {
    expect(isSessionCookieName("sb-abcdef-auth-token")).toBe(true);
    expect(isSessionCookieName("sb-abcdef-auth-token.0")).toBe(true);
    expect(isSessionCookieName("sb-abcdef-auth-token.12")).toBe(true);
  });

  it("skips sign-in leftovers and other cookies", () => {
    expect(isSessionCookieName("sb-abcdef-auth-token-code-verifier")).toBe(false);
    expect(isSessionCookieName("sb-abcdef-auth-token-flows-code-verifier")).toBe(false);
    expect(isSessionCookieName("sb-abcdef-auth-token-flow-17da53477a742880ec9bf07e31f2908c-code-verifier")).toBe(false);
    expect(isSessionCookieName("NEXT_LOCALE")).toBe(false);
  });
});
