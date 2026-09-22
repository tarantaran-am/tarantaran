import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/shared/config/seo";
import { ForVendorsScreen } from "@/features/for-vendors/ForVendorsScreen";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ForVendorsPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localizedAlternates("/for-vendors")),
  };
}

export default function ForVendorsPage() {
  return <ForVendorsScreen />;
}
