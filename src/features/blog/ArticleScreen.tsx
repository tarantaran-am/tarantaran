import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getBlogPost } from "@/features/blog/posts";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { photoOrPlaceholder } from "@/shared/lib/photo";
import { getRequestLocale } from "@/i18n/locale";
import { SITE_URL } from "@/shared/config/seo";
import { JsonLd } from "@/shared/components/JsonLd";
import { getPathname } from "@/i18n/navigation";
import { BRAND } from "@/shared/config/site";

export async function ArticleScreen({ slug }: { slug: string }) {
  const lang = await getRequestLocale();
  const tCrumbs = await getTranslations("Breadcrumbs");
  const post = getBlogPost(slug, lang);
  if (!post) notFound();

  const { default: Content } = await import(`@/content/blog/${slug}/${post.locale}.mdx`);

  const url = new URL(getPathname({ href: `/blog/${slug}`, locale: lang }), SITE_URL).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover ? new URL(post.cover, SITE_URL).toString() : undefined,
    datePublished: post.publishedAt,
    inLanguage: lang,
    author: { "@type": "Organization", name: BRAND },
    publisher: { "@type": "Organization", name: BRAND },
  };

  return (
    <article className="max-w-[820px]">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        locale={lang}
        items={[
          { label: tCrumbs("home"), href: "/" },
          { label: tCrumbs("blog"), href: "/blog" },
          { label: post.title },
        ]}
      />
      <h1 className="mt-4 mb-6 font-serif text-[length:var(--text-article)] leading-[1.1] text-foreground">
        {post.title}
      </h1>
      <time className="text-xs text-muted-foreground" dateTime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString(lang, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </time>

      <div className="relative mt-8 mb-10 aspect-golden overflow-hidden bg-muted">
        <Image src={photoOrPlaceholder(post.cover)} alt={post.title} fill sizes="820px" className="object-cover" />
      </div>

      <Content />
    </article>
  );
}
