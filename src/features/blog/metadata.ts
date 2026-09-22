import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/locale";
import { getBlogPost } from "@/features/blog/posts";
import { localizedAlternates } from "@/shared/config/seo";

export async function getArticleMetadata(slug: string): Promise<Metadata> {
  const post = getBlogPost(slug, await getRequestLocale());
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    ...(await localizedAlternates(`/blog/${slug}`)),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}
