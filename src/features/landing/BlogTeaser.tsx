import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlogCard } from "@/features/blog/BlogCard";
import { getBlogPosts } from "@/features/blog/posts";
import { getRequestLocale } from "@/i18n/locale";
import { Container } from "@/shared/components/container";
import { SectionTitle } from "@/shared/components/SectionTitle";

export async function BlogTeaser() {
  const t = await getTranslations("BlogTeaser");
  const posts = getBlogPosts(await getRequestLocale()).slice(0, 3);

  return (
    <section className="bg-card">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionTitle eyebrow={t("eyebrow")} title={t("title")} />
          <Link
            href="/blog"
            className="group flex items-center gap-2 self-start pb-1 text-sm text-foreground sm:self-auto"
          >
            <span>{t("cta")}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
