import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// A couple's own invitation and its replies stay out of search; the builder at /invitations/new is public.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Invitations");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}
