import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, isCategory, type CategorySlug } from "@/shared/config/category";
import { PHOTO_PLACEHOLDER } from "@/shared/lib/photo";
import type { Category } from "@/shared/model/types";

const COVER_DIR = path.join(process.cwd(), "public/categories");

function cover(slug: CategorySlug): string {
  return fs.existsSync(path.join(COVER_DIR, `${slug}.jpg`)) ? `/categories/${slug}.jpg` : PHOTO_PLACEHOLDER;
}

export async function getCategories(): Promise<Category[]> {
  const t = await getTranslations("Category");
  return CATEGORIES.map((slug) => ({
    slug,
    name: t(`${slug}.name`),
    namePlural: t(`${slug}.namePlural`),
    description: t(`${slug}.description`),
    cover: cover(slug),
  }));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  if (!isCategory(slug)) return undefined;
  const t = await getTranslations("Category");
  return {
    slug,
    name: t(`${slug}.name`),
    namePlural: t(`${slug}.namePlural`),
    description: t(`${slug}.description`),
    cover: cover(slug),
  };
}
