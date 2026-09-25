import { describe, expect, it } from "vitest";
import { describePeriod } from "@/features/admin/periods";
import { buildVendorReport } from "./report";
import type { VendorStats } from "./queries";

const row: VendorStats = {
  vendor: { id: "1", nameRu: "REC Agency", slug: "REC_agency", category: "reels", isPublished: true },
  reveals: 12,
  clicks: { instagram: 5, facebook: 0, tiktok: 0, telegram: 0, whatsapp: 3, website: 1 },
  totalClicks: 9,
  leads: 2,
};

describe("buildVendorReport", () => {
  it("lists the numbers and only the networks that were clicked", () => {
    const report = buildVendorReport(row, "за 30 дней", "https://tarantaran.am/ru/catalog/reels/REC_agency");
    expect(report).toContain("Taran Taran: статистика за 30 дней");
    expect(report).toContain("👁 Открыли ваши контакты: 12");
    expect(report).toContain("📲 Перешли в соцсети и на сайт: 9 (Instagram — 5, WhatsApp — 3, Сайт — 1)");
    expect(report).toContain("📩 Заявки через сайт: 2");
    expect(report).not.toContain("Facebook");
  });

  it("drops the breakdown when nothing was clicked", () => {
    const quiet = { ...row, clicks: { ...row.clicks, instagram: 0, whatsapp: 0, website: 0 }, totalClicks: 0 };
    expect(buildVendorReport(quiet, "за 7 дней", "x")).toContain("📲 Перешли в соцсети и на сайт: 0\n");
  });
});

describe("describePeriod", () => {
  it("gives the date range in Yerevan time", () => {
    expect(describePeriod("30", new Date("2026-09-25T10:00:00Z"))).toBe(
      "за 30 дней (26 августа — 25 сентября 2026 г.)",
    );
    expect(describePeriod("all")).toBe("за всё время");
  });
});
