import { describe, expect, it } from "vitest";
import { eventDateBounds, isEventDateInRange } from "./lead-limits";

const NOW = new Date("2026-09-24T12:00:00Z");

describe("eventDateBounds", () => {
  it("runs from today to three years ahead", () => {
    expect(eventDateBounds(NOW, "Asia/Yerevan")).toEqual({ min: "2026-09-24", max: "2029-09-24" });
  });
});

describe("isEventDateInRange", () => {
  it("accepts dates from today to three years ahead", () => {
    expect(isEventDateInRange("2026-09-24", NOW)).toBe(true);
    expect(isEventDateInRange("2027-06-15", NOW)).toBe(true);
    expect(isEventDateInRange("2029-09-24", NOW)).toBe(true);
  });

  it("rejects past dates and dates too far ahead", () => {
    expect(isEventDateInRange("2026-09-01", NOW)).toBe(false);
    expect(isEventDateInRange("2031-01-01", NOW)).toBe(false);
    expect(isEventDateInRange("275760-02-10", NOW)).toBe(false);
  });
});
