import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CategorySlug } from "@/shared/config/category";
import type { Locale } from "@/shared/model/types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/categories");

// Blog guides shown under a category. The posts link back to their categories from their own text.
export const RELATED_POSTS: Record<CategorySlug, string[]> = {
  venues: ["choosing-a-venue", "how-many-guests", "choosing-a-date"],
  photographers: ["choosing-a-photographer", "church-ceremony", "wedding-day-timeline"],
  videographers: ["choosing-a-photographer", "wedding-day-timeline", "church-ceremony"],
  decor: ["decor-and-flowers", "church-ceremony", "choosing-a-venue"],
  reels: ["choosing-a-photographer", "wedding-day-timeline"],
  stylists: ["wedding-dress", "wedding-day-timeline"],
  dresses: ["wedding-dress", "church-ceremony"],
  cakes: ["wedding-budget", "how-many-guests"],
  cars: ["wedding-day-timeline", "armenian-wedding-traditions"],
  hosts: ["host-and-tamada", "armenian-wedding-traditions"],
  show: ["armenian-wedding-traditions", "host-and-tamada"],
  choreographers: ["armenian-wedding-traditions", "wedding-day-timeline"],
  catering: ["how-many-guests", "choosing-a-venue", "wedding-budget"],
  dj: ["host-and-tamada", "wedding-day-timeline"],
};

export type CategoryFaq = { question: string; answer: string };

// The questions live in the frontmatter of the category's text, so the answers and the text are edited together.
export function getCategoryFaq(slug: CategorySlug, locale: Locale): CategoryFaq[] {
  const file = path.join(CONTENT_DIR, slug, `${locale}.mdx`);
  if (!fs.existsSync(file)) return [];
  const { data } = matter(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data.faq)) return [];
  return data.faq.flatMap((item: { q?: unknown; a?: unknown }) =>
    item.q && item.a ? [{ question: String(item.q), answer: String(item.a) }] : [],
  );
}
