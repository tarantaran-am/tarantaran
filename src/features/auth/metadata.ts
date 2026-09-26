import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// Sign-in pages are per-person and have nothing worth indexing.
export function authPageMetadata(key: "signup" | "login" | "confirm" | "account") {
  return async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Auth");
    return { title: t(`${key}.metaTitle`), robots: { index: false, follow: false } };
  };
}
