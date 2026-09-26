import { describe, expect, it } from "vitest";
import { authHint, isSessionCookieName } from "./auth-cookie";

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

describe("authHint", () => {
  it("is a guest without a session, whatever else is set", () => {
    expect(authHint("")).toBe("guest");
    expect(authHint("NEXT_LOCALE=ru; tt_role=couple")).toBe("guest");
    expect(authHint("sb-abc-auth-token-code-verifier=x")).toBe("guest");
  });

  it("reads the role next to a session", () => {
    expect(authHint("NEXT_LOCALE=ru; sb-abc-auth-token.0=x; tt_role=couple")).toBe("couple");
    expect(authHint("tt_role=vendor; sb-abc-auth-token=x")).toBe("vendor");
  });

  it("is a member while the role is unknown", () => {
    expect(authHint("sb-abc-auth-token=x")).toBe("member");
    expect(authHint("sb-abc-auth-token=x; tt_role=admin")).toBe("member");
  });
});
