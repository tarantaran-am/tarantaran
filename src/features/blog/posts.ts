import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/shared/model/types";
import { type Rubric, isRubric } from "./rubrics";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

export type { Rubric };

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  publishedAt: string;
  rubric: Rubric;
  locale: Locale;
};

const FALLBACK: Locale[] = ["ru", "en", "hy"];

function readMeta(slug: string, locale: Locale): BlogPostMeta | undefined {
  if (!isSafeSlug(slug)) return undefined;
  const file = path.join(BLOG_DIR, slug, `${locale}.mdx`);
  if (!fs.existsSync(file)) return undefined;

  const { data } = matter(fs.readFileSync(file, "utf8"));
  if (!data.title || !data.publishedAt || !isRubric(data.rubric)) return undefined;

  return {
    slug,
    title: String(data.title),
    excerpt: String(data.excerpt ?? ""),
    cover: String(data.cover ?? ""),
    publishedAt: String(data.publishedAt),
    rubric: data.rubric,
    locale,
  };
}

function resolveLocale(slug: string, locale: Locale): Locale | undefined {
  if (!isSafeSlug(slug)) return undefined;
  for (const candidate of [locale, ...FALLBACK]) {
    if (fs.existsSync(path.join(BLOG_DIR, slug, `${candidate}.mdx`))) return candidate;
  }
  return undefined;
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

export function getBlogPosts(locale: Locale): BlogPostMeta[] {
  return getBlogSlugs()
    .map((slug) => {
      const resolved = resolveLocale(slug, locale);
      return resolved ? readMeta(slug, resolved) : undefined;
    })
    .filter((p): p is BlogPostMeta => Boolean(p))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export type BlogFilters = {
  rubric?: Rubric;
  query?: string;
};

export function filterBlogPosts(posts: BlogPostMeta[], filters: BlogFilters): BlogPostMeta[] {
  let result = posts;

  if (filters.rubric) {
    result = result.filter((p) => p.rubric === filters.rubric);
  }

  const q = filters.query?.trim().toLowerCase();
  if (q) {
    result = result.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
  }

  return result;
}

export function getBlogPost(slug: string, locale: Locale): BlogPostMeta | undefined {
  const resolved = resolveLocale(slug, locale);
  return resolved ? readMeta(slug, resolved) : undefined;
}
