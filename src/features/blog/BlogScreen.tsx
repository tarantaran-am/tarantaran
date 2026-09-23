import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { BlogCard } from "@/features/blog/BlogCard";
import { SearchField } from "@/shared/components/SearchField";
import { filterBlogPosts, getBlogPosts } from "@/features/blog/posts";
import { isRubric } from "@/features/blog/rubrics";
import { getRequestLocale } from "@/i18n/locale";
import { stringParam, type SearchParams } from "@/shared/lib/listing-params";

export async function BlogScreen({ searchParams: params }: { searchParams: SearchParams }) {
  const lang = await getRequestLocale();
  const t = await getTranslations("BlogIndexPage");
  const tCrumbs = await getTranslations("Breadcrumbs");

  const rubric = isRubric(params.rubric) ? params.rubric : undefined;
  const query = stringParam(params.q);

  const posts = filterBlogPosts(getBlogPosts(lang), { rubric, query });

  return (
    <>
      <SectionHeading
        breadcrumbs={
          <Breadcrumbs locale={lang} items={[{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("blog") }]} />
        }
        title={t("title")}
        description={t("description")}
      />
      <SearchField query={query} placeholder={t("searchPlaceholder")} className="mb-10" />
      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
