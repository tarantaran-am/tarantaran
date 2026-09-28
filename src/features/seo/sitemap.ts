import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getBlogPosts } from "@/features/blog/posts";
import { getVendorPaths } from "@/shared/lib/queries";
import { CATEGORIES } from "@/shared/config/category";
import { SITE_URL } from "@/shared/config/seo";
import type { Locale } from "@/shared/model/types";

type Entry = MetadataRoute.Sitemap[number];

const STATIC_PATHS = [
  "/",
  "/catalog",
  "/about",
  "/contacts",
  "/privacy",
  "/terms",
  "/for-vendors",
  "/blog",
  "/faq",
  "/invitations/new",
];

// Every language version is an entry of its own, each listing all the others (what Google asks for); search engines
// that ignore the alternates, like Yandex, still find the ru and en pages.
function entries(path: string, extra: Partial<Entry>): Entry[] {
  const url = (locale: Locale) => new URL(getPathname({ href: path, locale }), SITE_URL).toString();
  const languages = {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, url(locale)])),
    "x-default": url(routing.defaultLocale),
  };
  return routing.locales.map((locale) => ({ url: url(locale), alternates: { languages }, ...extra }));
}

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const vendorPaths = await getVendorPaths();
  return [
    ...STATIC_PATHS.flatMap((path) => entries(path, { changeFrequency: "monthly", priority: path === "/" ? 1 : 0.5 })),
    ...CATEGORIES.flatMap((slug) => entries(`/catalog/${slug}`, { changeFrequency: "daily", priority: 0.9 })),
    ...vendorPaths.flatMap(({ category, slug }) =>
      entries(`/catalog/${category}/${slug}`, { changeFrequency: "weekly", priority: 0.7 }),
    ),
    ...getBlogPosts(routing.defaultLocale).flatMap((post) =>
      entries(`/blog/${post.slug}`, {
        changeFrequency: "monthly",
        priority: 0.4,
        lastModified: post.publishedAt,
      }),
    ),
  ];
}
