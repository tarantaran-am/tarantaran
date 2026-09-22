import { BlogShell } from "@/features/blog/BlogShell";

export default function BlogLayout({ children }: LayoutProps<"/[locale]/blog">) {
  return <BlogShell>{children}</BlogShell>;
}
