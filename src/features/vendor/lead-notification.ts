import "server-only";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Category } from "@/generated/prisma/client";
import { SITE_URL } from "@/shared/config/seo";
import { socialUrl } from "@/shared/config/social";
import { escapeHtml, sendTelegramMessage } from "@/shared/lib/telegram";
import type { Locale } from "@/shared/model/types";

// The admin reads these in Russian whatever language the visitor used.
const ADMIN_LOCALE = "ru";

const LANGUAGE_NAMES: Record<Locale, string> = { hy: "армянский", ru: "русский", en: "английский" };

export type LeadNotification = {
  vendor: {
    slug: string;
    category: Category;
    nameRu: string;
    phone: string;
    whatsapp: string | null;
    telegram: string | null;
  };
  lead: {
    name: string;
    phone: string;
    eventDate: string;
    message: string;
    whatsapp: boolean;
    telegram: boolean;
    locale: Locale;
  };
};

const link = (href: string, label: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;

export async function notifyNewLead({ vendor, lead }: LeadNotification): Promise<void> {
  const tCategory = await getTranslations({ locale: ADMIN_LOCALE, namespace: "Category" });
  const vendorUrl = new URL(
    getPathname({ href: `/catalog/${vendor.category}/${vendor.slug}`, locale: ADMIN_LOCALE }),
    SITE_URL,
  ).toString();

  const vendorContacts = [
    escapeHtml(vendor.phone),
    vendor.whatsapp && link(socialUrl("whatsapp", vendor.whatsapp), "WhatsApp"),
    vendor.telegram && link(socialUrl("telegram", vendor.telegram), "Telegram"),
  ].filter(Boolean);

  const clientDigits = lead.phone.replace(/\D/g, "");
  const contactVia = [
    lead.whatsapp && link(`https://wa.me/${clientDigits}`, "WhatsApp"),
    lead.telegram && link(`https://t.me/+${clientDigits}`, "Telegram"),
  ].filter(Boolean);

  const eventDate = lead.eventDate
    ? new Date(lead.eventDate).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "не указана";

  const lines = [
    "<b>📩 Новая заявка</b>",
    "",
    `<b>Подрядчик:</b> ${link(vendorUrl, vendor.nameRu)} · ${escapeHtml(tCategory(`${vendor.category}.name`))}`,
    `Контакты подрядчика: ${vendorContacts.join(" · ")}`,
    "",
    `<b>Клиент:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
    `<b>Связаться:</b> ${contactVia.length > 0 ? contactVia.join(", ") : "звонком"}`,
    `<b>Дата мероприятия:</b> ${eventDate}`,
    `<b>Язык сайта:</b> ${LANGUAGE_NAMES[lead.locale]}`,
    ...(lead.message ? ["", "<b>Сообщение:</b>", `<blockquote>${escapeHtml(lead.message)}</blockquote>`] : []),
  ];

  await sendTelegramMessage(lines.join("\n"));
}
