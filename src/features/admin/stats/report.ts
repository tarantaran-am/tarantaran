import { SOCIAL_LABELS, SOCIAL_NETWORKS } from "@/shared/config/social";
import type { VendorStats } from "./queries";

// Plain text for a vendor, ready to paste into WhatsApp or Telegram.
export function buildVendorReport(row: VendorStats, periodText: string, pageUrl: string): string {
  const clicks = SOCIAL_NETWORKS.filter((network) => row.clicks[network] > 0)
    .map((network) => `${network === "website" ? "Сайт" : SOCIAL_LABELS[network]} — ${row.clicks[network]}`)
    .join(", ");

  return [
    `Taran Taran: статистика ${periodText}`,
    row.vendor.nameRu,
    "",
    `👁 Открыли ваши контакты: ${row.reveals}`,
    `📲 Перешли в соцсети и на сайт: ${row.totalClicks}${clicks ? ` (${clicks})` : ""}`,
    `📩 Заявки через сайт: ${row.leads}`,
    "",
    `Ваша страница: ${pageUrl}`,
  ].join("\n");
}
