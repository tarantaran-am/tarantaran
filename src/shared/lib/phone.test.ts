import { describe, expect, it } from "vitest";
import { formatFullPhone, formatPhoneDigits, isValidPhone, phonePlaceholder } from "./phone";

describe("formatPhoneDigits", () => {
  it("groups Armenian numbers in pairs as they are typed", () => {
    expect(formatPhoneDigits("AM", "912")).toBe("91 2");
    expect(formatPhoneDigits("AM", "91234567")).toBe("91 23 45 67");
  });

  it("uses each country's own grouping", () => {
    expect(formatPhoneDigits("RU", "9123456789")).toBe("912 345 67 89");
    expect(formatPhoneDigits("US", "2015550123")).toBe("201 555 0123");
    expect(formatPhoneDigits("FR", "612345678")).toBe("6 12 34 56 78");
  });

  it("drops non-digits and caps the length", () => {
    expect(formatPhoneDigits("AM", "91-23 abc 45(67)")).toBe("91 23 45 67");
    expect(formatPhoneDigits("AM", "9123456789")).toBe("91 23 45 67");
    expect(formatPhoneDigits("other", "9875645334211111111111111111111111")).toBe("987564533421111");
  });

  it("strips the country code and the domestic prefix from pasted numbers", () => {
    expect(formatPhoneDigits("AM", "+374 91 234567")).toBe("91 23 45 67");
    expect(formatPhoneDigits("AM", "091 234 567")).toBe("91 23 45 67");
    expect(formatPhoneDigits("RU", "+7 912 345-67-89")).toBe("912 345 67 89");
    expect(formatPhoneDigits("RU", "8 912 345 67 89")).toBe("912 345 67 89");
    expect(formatPhoneDigits("US", "1 (201) 555-0123")).toBe("201 555 0123");
  });

  it("keeps a short number that merely starts like a code", () => {
    expect(formatPhoneDigits("AM", "0912")).toBe("09 12");
  });
});

describe("isValidPhone", () => {
  it("requires the country's number length", () => {
    expect(isValidPhone("AM", "91 23 45 67")).toBe(true);
    expect(isValidPhone("AM", "91 23 45 6")).toBe(false);
    expect(isValidPhone("RU", "912 345 67 89")).toBe(true);
    expect(isValidPhone("DE", "30 1234567")).toBe(true);
  });

  it("accepts 8 to 15 digits for other countries", () => {
    expect(isValidPhone("other", "54 11 2345 6789")).toBe(true);
    expect(isValidPhone("other", "1234567")).toBe(false);
  });

  it("rejects unknown countries", () => {
    expect(isValidPhone("XX", "91234567")).toBe(false);
  });
});

describe("formatFullPhone", () => {
  it("returns the stored format", () => {
    expect(formatFullPhone("AM", "098112171")).toBe("+374 98 11 21 71");
    expect(formatFullPhone("RU", "89123456789")).toBe("+7 912 345 67 89");
    expect(formatFullPhone("other", "+54 11 2345 6789")).toBe("+541123456789");
  });
});

describe("phonePlaceholder", () => {
  it("shows an example in the country's grouping", () => {
    expect(phonePlaceholder("AM")).toBe("91 23 45 67");
    expect(phonePlaceholder("US")).toBe("912 345 6789");
  });
});
