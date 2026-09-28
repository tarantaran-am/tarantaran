import { getTranslations } from "next-intl/server";
import { getRequestLocale } from "@/i18n/locale";
import { BlogCard } from "@/features/blog/BlogCard";
import { getBlogPosts } from "@/features/blog/posts";
import { RELATED_POSTS, getCategoryFaq } from "@/features/catalog/content";
import { FaqList, faqJsonLd } from "@/shared/components/FaqList";
import { JsonLd } from "@/shared/components/JsonLd";
import type { CategorySlug } from "@/shared/config/category";

const headingClass = "mb-6 font-serif text-2xl text-foreground";

// The text, questions and guides under a category's vendors: what the page ranks on besides the listings.
export async function CategoryGuide({ slug }: { slug: CategorySlug }) {
  const locale = await getRequestLocale();
  const t = await getTranslations("CategoryPage");
  const { default: Content } = await import(`@/content/categories/${slug}/${locale}.mdx`);
  const faq = getCategoryFaq(slug, locale);
  const allPosts = getBlogPosts(locale);
  const posts = RELATED_POSTS[slug].flatMap((postSlug) => allPosts.filter((post) => post.slug === postSlug));

  return (
    <div className="mt-20 flex flex-col gap-16 border-t border-border pt-8">
      <div className="max-w-[820px]">
        <Content />
      </div>

      {faq.length > 0 && (
        <section className="max-w-[820px]">
          <JsonLd data={faqJsonLd(faq)} />
          <h2 className={headingClass}>{t("faq")}</h2>
          <FaqList items={faq.map((item) => ({ id: item.question, ...item }))} />
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className={headingClass}>{t("posts")}</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
