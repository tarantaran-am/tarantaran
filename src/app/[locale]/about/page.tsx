import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/shared/config/seo";
import { AboutScreen } from "@/features/landing/AboutScreen";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localizedAlternates("/about")),
  };
}

export default function AboutPage() {
  return <AboutScreen />;
}
