import { describe, expect, it } from "vitest";
import { EMPTY_DRAFT, invalidFields, isMapUrl, splitStartsAt, startsAt } from "./content";

describe("isMapUrl", () => {
  it("accepts Google and Yandex Maps links", () => {
    expect(isMapUrl("https://maps.app.goo.gl/AbCd123")).toBe(true);
    expect(isMapUrl("https://www.google.com/maps/place/Yerevan")).toBe(true);
    expect(isMapUrl("https://www.google.am/maps/@40.1,44.5,15z")).toBe(true);
    expect(isMapUrl("https://yandex.ru/maps/-/CDabc")).toBe(true);
    expect(isMapUrl("https://yandex.com/maps/org/123")).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isMapUrl("http://maps.app.goo.gl/AbCd123")).toBe(false);
    expect(isMapUrl("https://google.com/search?q=maps")).toBe(false);
    expect(isMapUrl("https://evil.example/maps")).toBe(false);
    expect(isMapUrl("https://maps.google.com.evil.example/")).toBe(false);
    expect(isMapUrl("javascript:alert(1)")).toBe(false);
  });
});

// A year from now, so the date stays in the allowed range whenever the tests run.
const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

describe("invalidFields", () => {
  const valid = {
    ...EMPTY_DRAFT,
    partnerOne: "Անի",
    partnerTwo: "Aram",
    date: nextYear,
    venueName: "Ararat Hall",
  };

  it("accepts a filled-in invitation", () => {
    expect(invalidFields(valid)).toEqual([]);
  });

  it("lists what is missing or wrong", () => {
    expect(invalidFields(EMPTY_DRAFT)).toEqual(
      expect.arrayContaining(["partnerOne", "partnerTwo", "date", "venueName"]),
    );
    expect(invalidFields({ ...valid, partnerOne: "Ani 2" })).toEqual(["partnerOne"]);
    expect(invalidFields({ ...valid, mapUrl: "https://evil.example" })).toEqual(["mapUrl"]);
    // The deadline for answers must not be after the wedding.
    const dayAfter = new Date(Date.parse(nextYear) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(invalidFields({ ...valid, rsvpDeadline: dayAfter })).toEqual(["rsvpDeadline"]);
  });
});

describe("startsAt", () => {
  it("reads the date and time as Yerevan time and gives them back", () => {
    const value = startsAt({ date: "2027-06-12", time: "16:30" });
    expect(value.toISOString()).toBe("2027-06-12T12:30:00.000Z");
    expect(splitStartsAt(value)).toEqual({ date: "2027-06-12", time: "16:30" });
  });
});
