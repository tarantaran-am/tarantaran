import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getBlogSlugs } from "@/features/blog/posts";
import { getVendorPaths } from "@/shared/lib/queries";
import { CATEGORIES } from "@/shared/config/category";
import { SITE_URL } from "@/shared/config/seo";

type Entry = MetadataRoute.Sitemap[number];

const STATIC_PATHS = ["/", "/catalog", "/about", "/contacts", "/privacy", "/terms", "/for-vendors", "/blog", "/faq"];

function entry(path: string, extra: Partial<Entry>): Entry {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, new URL(getPathname({ href: path, locale }), SITE_URL).toString()]),
  );
  return {
    url: new URL(getPathname({ href: path, locale: routing.defaultLocale }), SITE_URL).toString(),
    alternates: { languages },
    ...extra,
  };
}

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const vendorPaths = await getVendorPaths();

  return [
    ...STATIC_PATHS.map((path) => entry(path, { changeFrequency: "monthly", priority: path === "/" ? 1 : 0.5 })),
    ...CATEGORIES.map((slug) => entry(`/catalog/${slug}`, { changeFrequency: "daily", priority: 0.9 })),
    ...vendorPaths.map(({ category, slug }) =>
      entry(`/catalog/${category}/${slug}`, { changeFrequency: "weekly", priority: 0.7 }),
    ),
    ...getBlogSlugs().map((slug) => entry(`/blog/${slug}`, { changeFrequency: "monthly", priority: 0.4 })),
  ];
}
