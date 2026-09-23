import { staticPageMetadata } from "@/shared/config/seo";
import { BlogScreen } from "@/features/blog/BlogScreen";

export const generateMetadata = staticPageMetadata("BlogIndexPage", "/blog", {
  title: "title",
  description: "description",
});

export default async function BlogIndexPage(props: PageProps<"/[locale]/blog">) {
  return <BlogScreen searchParams={await props.searchParams} />;
}
