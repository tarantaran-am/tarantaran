import "server-only";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const href = (l: Locale) => getPathname({ href: path, locale: l });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, href(l)]));
  return {
    alternates: {
      canonical: href(locale),
      languages: { ...languages, "x-default": href(routing.defaultLocale) },
    },
  };
}

type OpenGraph = NonNullable<Metadata["openGraph"]>;

// Next.js replaces the layout's `openGraph` as a whole when a page sets its own, so pages build theirs with this
// to keep the site name and locale.
export async function localizedOpenGraph(openGraph: OpenGraph = {}): Promise<OpenGraph> {
  const [locale, tBrand] = await Promise.all([getRequestLocale(), getTranslations("Brand")]);
  return { siteName: tBrand("name"), locale: ogLocale(locale), type: "website", ...openGraph };
}

type MetadataKeys = { title: string; description: string };

const META_KEYS: MetadataKeys = { title: "metaTitle", description: "metaDescription" };

// `generateMetadata` for a page whose title and description live in one translation namespace.
export function staticPageMetadata(namespace: string, path: string, keys: Partial<MetadataKeys> = {}) {
  const { title, description } = { ...META_KEYS, ...keys };
  return async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations(namespace);
    return {
      title: t(title),
      description: t(description),
      ...(await localizedAlternates(path)),
    };
  };
}
