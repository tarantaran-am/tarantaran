import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/shared/config/seo";
import { CatalogScreen } from "@/features/catalog/CatalogScreen";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CatalogPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localizedAlternates("/catalog")),
  };
}

export default async function CatalogPage(props: PageProps<"/[locale]/catalog">) {
  return <CatalogScreen searchParams={await props.searchParams} />;
}
