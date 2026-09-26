import { describe, expect, it } from "vitest";
import { parseRole } from "./params";

describe("parseRole", () => {
  it("accepts the two roles", () => {
    expect(parseRole("couple")).toBe("couple");
    expect(parseRole("vendor")).toBe("vendor");
  });

  it("drops anything else", () => {
    expect(parseRole(null)).toBeNull();
    expect(parseRole("")).toBeNull();
    expect(parseRole("admin")).toBeNull();
    expect(parseRole("Couple")).toBeNull();
  });
});
