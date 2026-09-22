import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/shared/config/seo";
import { LegalScreen } from "@/features/legal/LegalScreen";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PrivacyPage");
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...(await localizedAlternates("/privacy")),
  };
}

export default function PrivacyPage() {
  return <LegalScreen doc="privacy" />;
}
