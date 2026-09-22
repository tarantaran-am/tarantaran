import "server-only";
import { env } from "@/env";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/locale";
import { Locale } from "@/shared/model/types";

export const SITE_URL = env.NEXT_PUBLIC_APP_URL;

const OG_LOCALE: Record<Locale, string> = {
  hy: "hy_AM",
  ru: "ru_RU",
  en: "en_US",
};

export function ogLocale(locale: Locale): string {
  return OG_LOCALE[locale];
}

export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function localizedAlternates(path: string) {
  const locale = await getRequestLocale();
  const languages = Object.fromEntries(routing.locales.map((l) => [l, getPathname({ href: path, locale: l })]));
  return {
    alternates: {
      canonical: getPathname({ href: path, locale }),
      languages: {
        ...languages,
        "x-default": getPathname({ href: path, locale: routing.defaultLocale }),
      },
    },
  };
}
