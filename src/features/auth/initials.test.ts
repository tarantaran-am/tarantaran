import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("takes the first and last name", () => {
    expect(initials("Tigran Arakyan", "t@example.com")).toBe("TA");
    expect(initials("  Анна  Мария Петросян ", "a@example.com")).toBe("АП");
    expect(initials("Արամ Սարգսյան", "a@example.com")).toBe("ԱՍ");
  });

  it("uses one letter for a single name", () => {
    expect(initials("tigran", "t@example.com")).toBe("T");
  });

  it("falls back to the email", () => {
    expect(initials(null, "hello@tarantaran.am")).toBe("H");
    expect(initials("   ", "hello@tarantaran.am")).toBe("H");
  });
});
