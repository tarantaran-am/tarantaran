import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// The builder and the replies are per-couple and stay out of search.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Invitations");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}
