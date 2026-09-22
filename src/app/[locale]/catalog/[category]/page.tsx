import { routing } from "@/i18n/routing";
import { CATEGORIES } from "@/shared/config/category";
import { getCategoryMetadata } from "@/features/catalog/metadata";
import { CategoryScreen } from "@/features/catalog/CategoryScreen";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CATEGORIES.map((category) => ({ locale, category })));
}

export async function generateMetadata(props: PageProps<"/[locale]/catalog/[category]">) {
  const { category } = await props.params;
  return getCategoryMetadata(category);
}

export default async function CategoryPage(props: PageProps<"/[locale]/catalog/[category]">) {
  const { category } = await props.params;
  return <CategoryScreen categorySlug={category} searchParams={await props.searchParams} />;
}
