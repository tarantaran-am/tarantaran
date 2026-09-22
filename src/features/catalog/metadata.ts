import type { Metadata } from "next";
import { getCategory } from "@/shared/lib/categories";
import { localizedAlternates } from "@/shared/config/seo";

export async function getCategoryMetadata(categorySlug: string): Promise<Metadata> {
  const category = await getCategory(categorySlug);
  if (!category) return {};
  return {
    title: category.namePlural,
    description: category.description,
    ...(await localizedAlternates(`/catalog/${categorySlug}`)),
    openGraph: {
      title: category.namePlural,
      description: category.description,
      images: [category.cover],
    },
  };
}
