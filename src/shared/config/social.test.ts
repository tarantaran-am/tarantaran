import { describe, expect, it } from "vitest";
import { socialUrl } from "./social";

describe("socialUrl", () => {
  it("keeps full URLs as they are", () => {
    expect(socialUrl("instagram", " https://www.instagram.com/panino_cake_ ")).toBe(
      "https://www.instagram.com/panino_cake_",
    );
  });

  it("builds URLs from handles", () => {
    expect(socialUrl("instagram", "@panino_cake_")).toBe("https://instagram.com/panino_cake_");
    expect(socialUrl("tiktok", "@dj_goodmen")).toBe("https://tiktok.com/@dj_goodmen");
    expect(socialUrl("telegram", "tarantaranam")).toBe("https://t.me/tarantaranam");
    expect(socialUrl("website", "panino.am")).toBe("https://panino.am");
  });

  it("keeps only digits in WhatsApp numbers", () => {
    expect(socialUrl("whatsapp", "+374 93 28-28-88")).toBe("https://wa.me/37493282888");
  });
});
