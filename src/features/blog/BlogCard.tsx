import { useTranslations } from "next-intl";
import Image from "next/image";
import { photoOrPlaceholder } from "@/shared/lib/photo";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "./posts";

export function BlogCard({ post }: { post: BlogPostMeta }) {
  const t = useTranslations("BlogIndexPage");

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative mb-4 aspect-golden overflow-hidden rounded-[20px] bg-muted">
        <Image
          src={photoOrPlaceholder(post.cover)}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/95 px-3 py-1 text-[10px] tracking-wider text-foreground uppercase">
          {t(`rubrics.${post.rubric}`)}
        </span>
      </div>
      <h3 className="mb-2 text-[15px] leading-snug font-medium text-foreground transition-colors group-hover:text-primary">
        {post.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
    </Link>
  );
}
