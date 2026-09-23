import "server-only";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Category } from "@/generated/prisma/client";
import { SITE_URL } from "@/shared/config/seo";
import { socialUrl } from "@/shared/config/social";
import { escapeHtml, sendTelegramMessage } from "@/shared/lib/telegram";
import type { Locale } from "@/shared/model/types";

// The admin reads the first message in Russian whatever language the visitor used.
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

type Lead = LeadNotification["lead"];

const link = (href: string, label: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// Two messages: a summary for the admin, then the request itself, in the visitor's language
// and as plain text, so it survives being forwarded in Telegram or pasted into WhatsApp.
export async function notifyNewLead({ vendor, lead }: LeadNotification): Promise<void> {
  const vendorText = await vendorMessage(lead);
  await sendTelegramMessage(await adminMessage({ vendor, lead }, vendorText), { html: true });
  await sendTelegramMessage(vendorText);
}

async function vendorMessage(lead: Lead): Promise<string> {
  const t = await getTranslations({ locale: lead.locale, namespace: "LeadNotification" });
  const tBrand = await getTranslations({ locale: lead.locale, namespace: "Brand" });
  const contactVia = [lead.whatsapp && "WhatsApp", lead.telegram && "Telegram"].filter(Boolean).join(", ");

  return [
    `💍 ${t("title", { brand: tBrand("name") })}`,
    "",
    `${t("name")}: ${lead.name}`,
    `${t("phone")}: ${lead.phone}`,
    `${t("contactVia")}: ${contactVia || t("call")}`,
    ...(lead.eventDate ? [`${t("eventDate")}: ${formatDate(lead.eventDate, lead.locale)}`] : []),
    ...(lead.message ? [`${t("message")}: ${lead.message}`] : []),
    "",
    new URL(SITE_URL).host,
  ].join("\n");
}

async function adminMessage({ vendor, lead }: LeadNotification, vendorText: string): Promise<string> {
  const tCategory = await getTranslations({ locale: ADMIN_LOCALE, namespace: "Category" });
  const vendorUrl = new URL(
    getPathname({ href: `/catalog/${vendor.category}/${vendor.slug}`, locale: ADMIN_LOCALE }),
    SITE_URL,
  ).toString();

  // Opens the vendor's WhatsApp chat with the request already typed in.
  const forwardUrl = new URL(
    vendor.whatsapp ? socialUrl("whatsapp", vendor.whatsapp) : `https://wa.me/${vendor.phone.replace(/\D/g, "")}`,
  );
  forwardUrl.searchParams.set("text", vendorText);

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

  const lines = [
    "<b>📩 Новая заявка</b>",
    "",
    `<b>Подрядчик:</b> ${link(vendorUrl, vendor.nameRu)} · ${escapeHtml(tCategory(`${vendor.category}.name`))}`,
    `Контакты подрядчика: ${vendorContacts.join(" · ")}`,
    `➡️ ${link(forwardUrl.toString(), "Отправить подрядчику в WhatsApp")}`,
    "",
    `<b>Клиент:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
    `<b>Связаться:</b> ${contactVia.length > 0 ? contactVia.join(", ") : "звонком"}`,
    `<b>Дата мероприятия:</b> ${lead.eventDate ? formatDate(lead.eventDate, ADMIN_LOCALE) : "не указана"}`,
    `<b>Язык сайта:</b> ${LANGUAGE_NAMES[lead.locale]}`,
    ...(lead.message ? ["", "<b>Сообщение:</b>", `<blockquote>${escapeHtml(lead.message)}</blockquote>`] : []),
    "",
    "Ниже — текст для подрядчика: перешлите его или скопируйте.",
  ];

  return lines.join("\n");
}
