import { describe, expect, it } from "vitest";
import { contactChannels, formatEventDate, formatReceivedAt, languageName, phoneDigits } from "./format";

describe("lead formatting", () => {
  it("shows when the lead came in, in Yerevan time", () => {
    // 20:30 UTC is already the next day, 00:30, in Yerevan (UTC+4).
    expect(formatReceivedAt(new Date("2026-09-24T20:30:00Z"))).toContain("25 сент");
    expect(formatReceivedAt(new Date("2026-09-24T20:30:00Z"))).toContain("00:30");
  });

  it("reads event dates as calendar days", () => {
    expect(formatEventDate(new Date("2026-10-10T00:00:00Z"))).toBe("10 октября 2026 г.");
    expect(formatEventDate(null)).toBe("—");
  });

  it("lists the channels the client asked for, or a call", () => {
    expect(contactChannels({ contactWhatsapp: true, contactTelegram: true })).toBe("WhatsApp, Telegram");
    expect(contactChannels({ contactWhatsapp: false, contactTelegram: false })).toBe("звонок");
  });

  it("names the site language and keeps phone digits only", () => {
    expect(languageName("hy")).toBe("армянский");
    expect(phoneDigits("+374 91 23 45 67")).toBe("37491234567");
  });
});
