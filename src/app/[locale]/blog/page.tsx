import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/shared/config/seo";
import { BlogScreen } from "@/features/blog/BlogScreen";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("BlogIndexPage");
  return {
    title: t("title"),
    description: t("description"),
    ...(await localizedAlternates("/blog")),
  };
}

export default async function BlogIndexPage(props: PageProps<"/[locale]/blog">) {
  return <BlogScreen searchParams={await props.searchParams} />;
}
