import { describe, expect, it } from "vitest";
import { parsePendingFavorite } from "./pending";

describe("parsePendingFavorite", () => {
  const vendorId = "2b1578c0-4d17-417a-b065-d86ee7142ea0";
  const parse = (value: unknown) => parsePendingFavorite(JSON.stringify(value));

  it("keeps the vendor and the page to return to", () => {
    expect(parse({ vendorId, returnTo: "/catalog/venues?marz=kotayk" })).toEqual({
      vendorId,
      returnTo: "/catalog/venues?marz=kotayk",
    });
  });

  it("drops anything but a vendor id", () => {
    expect(parse({ vendorId: "1; drop table", returnTo: "/catalog" })).toBeNull();
    expect(parsePendingFavorite("not json")).toBeNull();
    expect(parsePendingFavorite(undefined)).toBeNull();
  });

  it("returns to the account rather than to another site", () => {
    for (const returnTo of ["//evil.com", "/\\evil.com", "https://evil.com", "catalog", "/a\\b", 1, undefined]) {
      expect(parse({ vendorId, returnTo })?.returnTo).toBe("/account");
    }
  });
});
