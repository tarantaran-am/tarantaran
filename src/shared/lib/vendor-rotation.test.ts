import { describe, expect, it } from "vitest";
import { rotationOrder, rotationSeed } from "./vendor-rotation";

const vendors = Array.from({ length: 50 }, (_, i) => ({ id: `vendor-${i}`, isVerified: false }));

describe("rotationSeed", () => {
  it("turns over at 05:00 Yerevan time (01:00 UTC)", () => {
    expect(rotationSeed(new Date("2026-10-24T00:59:59Z"))).toBe("2026-10-23");
    expect(rotationSeed(new Date("2026-10-24T01:00:00Z"))).toBe("2026-10-24");
  });

  it("keeps the same day across Yerevan midnight", () => {
    expect(rotationSeed(new Date("2026-10-23T19:59:00Z"))).toBe(rotationSeed(new Date("2026-10-23T20:01:00Z")));
  });
});

describe("rotationOrder", () => {
  it("keeps every vendor exactly once", () => {
    const order = rotationOrder(vendors, "2026-10-23");
    expect(order).toHaveLength(vendors.length);
    expect(new Set(order)).toEqual(new Set(vendors.map((v) => v.id)));
  });

  it("is stable for a seed and does not depend on the input order", () => {
    const order = rotationOrder(vendors, "2026-10-23");
    expect(rotationOrder(vendors, "2026-10-23")).toEqual(order);
    expect(rotationOrder([...vendors].reverse(), "2026-10-23")).toEqual(order);
  });

  it("changes from day to day", () => {
    expect(rotationOrder(vendors, "2026-10-24")).not.toEqual(rotationOrder(vendors, "2026-10-23"));
  });

  it("puts verified vendors first", () => {
    const mixed = vendors.map((v, i) => ({ ...v, isVerified: i % 10 === 0 }));
    const order = rotationOrder(mixed, "2026-10-23");
    expect(new Set(order.slice(0, 5))).toEqual(
      new Set(["vendor-0", "vendor-10", "vendor-20", "vendor-30", "vendor-40"]),
    );
  });
});
