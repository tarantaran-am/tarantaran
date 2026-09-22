import { routing } from "@/i18n/routing";
import { getBlogSlugs } from "@/features/blog/posts";
import { getArticleMetadata } from "@/features/blog/metadata";
import { ArticleScreen } from "@/features/blog/ArticleScreen";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getBlogSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata(props: PageProps<"/[locale]/blog/[slug]">) {
  const { slug } = await props.params;
  return getArticleMetadata(slug);
}

export default async function BlogPostPage(props: PageProps<"/[locale]/blog/[slug]">) {
  const { slug } = await props.params;
  return <ArticleScreen slug={slug} />;
}
