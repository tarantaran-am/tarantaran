import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/locale";
import { getVendor } from "@/shared/lib/queries";
import { isCategory } from "@/shared/config/category";
import { localizedAlternates } from "@/shared/config/seo";

export async function getVendorMetadata(categorySlug: string, slug: string): Promise<Metadata> {
  if (!isCategory(categorySlug)) return {};
  const vendor = await getVendor(categorySlug, slug, await getRequestLocale());
  if (!vendor) return {};
  return {
    title: vendor.name,
    description: vendor.description,
    ...(await localizedAlternates(`/catalog/${categorySlug}/${slug}`)),
    openGraph: {
      title: vendor.name,
      description: vendor.description,
      type: "website",
      images: vendor.photos,
    },
  };
}
