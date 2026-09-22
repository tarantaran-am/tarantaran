import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/shared/config/seo";
import { ContactsScreen } from "@/features/landing/ContactsScreen";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ContactsPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...(await localizedAlternates("/contacts")),
  };
}

export default function ContactsPage() {
  return <ContactsScreen />;
}
