import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCategory } from "@/shared/lib/categories";
import { localizedAlternates, localizedOpenGraph } from "@/shared/config/seo";

export async function getCategoryMetadata(categorySlug: string): Promise<Metadata> {
  const category = await getCategory(categorySlug);
  if (!category) return {};
  const t = await getTranslations("CategoryPage");
  // The place is only in the <title>: the heading on the page stays true whatever the marz filter shows.
  const title = t("metaTitle", { title: category.title });
  const description = t("metaDescription", { title, description: category.description });
  return {
    title,
    description,
    ...(await localizedAlternates(`/catalog/${categorySlug}`)),
    openGraph: await localizedOpenGraph({ title, description, images: [category.cover] }),
  };
}
