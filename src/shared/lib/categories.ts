import "server-only";
import type { StaticImageData } from "next/image";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, isCategory, type CategorySlug } from "@/shared/config/category";
import type { Category } from "@/shared/model/types";
import venues from "@/assets/categories/venues.jpg";
import photographers from "@/assets/categories/photographers.jpg";
import videographers from "@/assets/categories/videographers.jpg";
import decor from "@/assets/categories/decor.jpg";
import reels from "@/assets/categories/reels.jpg";
import stylists from "@/assets/categories/stylists.jpg";
import dresses from "@/assets/categories/dresses.jpg";
import cakes from "@/assets/categories/cakes.jpg";
import cars from "@/assets/categories/cars.jpg";
import hosts from "@/assets/categories/hosts.jpg";
import show from "@/assets/categories/show.jpg";
import choreographers from "@/assets/categories/choreographers.jpg";
import catering from "@/assets/categories/catering.jpg";
import dj from "@/assets/categories/dj.jpg";

// Imported, so each lands under /_next/static/media with its content hash in the name and is served
// as immutable: browsers keep it across deploys instead of fetching it again after each one.
const COVERS: Record<CategorySlug, StaticImageData> = {
  venues,
  photographers,
  videographers,
  decor,
  reels,
  stylists,
  dresses,
  cakes,
  cars,
  hosts,
  show,
  choreographers,
  catering,
  dj,
};

function cover(slug: CategorySlug): string {
  return COVERS[slug].src;
}

export async function getCategories(): Promise<Category[]> {
  const t = await getTranslations("Category");
  return CATEGORIES.map((slug) => ({
    slug,
    name: t(`${slug}.name`),
    namePlural: t(`${slug}.namePlural`),
    title: t(`${slug}.title`),
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
    title: t(`${slug}.title`),
    description: t(`${slug}.description`),
    cover: cover(slug),
  };
}
