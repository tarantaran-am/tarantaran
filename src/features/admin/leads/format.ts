import type { Locale } from "@/shared/model/types";

const LANGUAGE_NAMES: Record<string, string> = { hy: "армянский", ru: "русский", en: "английский" };

export function languageName(locale: Locale | string): string {
  return LANGUAGE_NAMES[locale] ?? locale;
}

// When the request came in, in Armenian time.
export function formatReceivedAt(date: Date): string {
  return date.toLocaleString("ru-RU", {
    timeZone: "Asia/Yerevan",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Event dates are calendar days stored at UTC midnight, so they are read back in UTC.
export function formatEventDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("ru-RU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
}

export function contactChannels(lead: { contactWhatsapp: boolean; contactTelegram: boolean }): string {
  const channels = [lead.contactWhatsapp && "WhatsApp", lead.contactTelegram && "Telegram"].filter(Boolean);
  return channels.length > 0 ? channels.join(", ") : "звонок";
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}
