import "server-only";

import { cache } from "react";
import { prisma } from "@/shared/lib/db";
import { Prisma, type Category as CategoryEnum, type Marz } from "@/generated/prisma/client";
import { normalizePage, normalizeQuery, parseList } from "@/shared/lib/listing-params";
import { isMarz, type MarzSlug } from "@/shared/config/marz";
import { isCategory, type CategorySlug } from "@/shared/config/category";
import { SOCIAL_NETWORKS, socialUrl } from "@/shared/config/social";
import type { Locale, Vendor } from "@/shared/model/types";

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const _marzMatchesSchema: Exact<MarzSlug, Marz> = true;
void _marzMatchesSchema;
const _categoryMatchesSchema: Exact<CategorySlug, CategoryEnum> = true;
void _categoryMatchesSchema;

export type { Locale };

type Trilingual = {
  hy?: string | null;
  ru: string;
  en?: string | null;
};

function pick(v: Trilingual, locale: Locale): string {
  const value = locale === "hy" ? v.hy : locale === "en" ? v.en : v.ru;
  return value?.trim() ? value : v.ru;
}

type PhotoRow = { blobUrl: string; isCover: boolean };

type VendorRow = {
  id: string;
  slug: string;
  nameHy: string | null;
  nameRu: string;
  nameEn: string | null;
  descriptionHy: string | null;
  descriptionRu: string;
  descriptionEn: string | null;
  marzes: Marz[];
  address: string | null;
  phone: string;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  telegram: string | null;
  whatsapp: string | null;
  website: string | null;
  category: CategoryEnum;
  photos: PhotoRow[];
};

const vendorSelect = {
  id: true,
  slug: true,
  nameHy: true,
  nameRu: true,
  nameEn: true,
  descriptionHy: true,
  descriptionRu: true,
  descriptionEn: true,
  marzes: true,
  address: true,
  phone: true,
  instagram: true,
  facebook: true,
  tiktok: true,
  telegram: true,
  whatsapp: true,
  website: true,
  category: true,
  photos: {
    where: { isApproved: true },
    orderBy: { sortOrder: "asc" },
    select: { blobUrl: true, isCover: true },
  },
} as const;

function toVendor(row: VendorRow, locale: Locale): Vendor {
  const cover = row.photos.find((p) => p.isCover)?.blobUrl ?? row.photos[0]?.blobUrl ?? "";

  return {
    id: row.id,
    slug: row.slug,
    categorySlug: row.category,
    name: pick({ hy: row.nameHy, ru: row.nameRu, en: row.nameEn }, locale),
    marzes: row.marzes,
    address: row.address ?? "",
    description: pick({ hy: row.descriptionHy, ru: row.descriptionRu, en: row.descriptionEn }, locale),
    phone: row.phone,
    socials: Object.fromEntries(
      SOCIAL_NETWORKS.map((network) => [network, row[network] ? socialUrl(network, row[network]) : undefined]).filter(
        ([, url]) => url,
      ),
    ),
    cover,
    photos: row.photos.map((p) => p.blobUrl),
  };
}

export const getVendorCountByCategory = cache(async (): Promise<Partial<Record<CategorySlug, number>>> => {
  const grouped = await prisma.vendor.groupBy({
    by: ["category"],
    where: { isPublished: true },
    _count: { _all: true },
  });
  return Object.fromEntries(grouped.map((g) => [g.category, g._count._all]));
});

export const getPublishedVendorCount = cache(async (): Promise<number> =>
  prisma.vendor.count({ where: { isPublished: true } }),
);

export type VendorFilters = {
  marz?: string;
  page?: number;
};

export type VendorPage = {
  vendors: Vendor[];
  page: number;
  totalPages: number;
  total: number;
};

export const PAGE_SIZE = 24;

const DEFAULT_ORDER = { createdAt: "desc" } as const;

function marzWhere(marz: string | undefined): Prisma.VendorWhereInput {
  const values = parseList(marz);
  return values.length > 0 ? { marzes: { hasSome: values.filter(isMarz) } } : {};
}

function categoriesWhere(categories: string | undefined): Prisma.VendorWhereInput {
  const slugs = parseList(categories);
  return slugs.length > 0 ? { category: { in: slugs.filter(isCategory) } } : {};
}

export async function getVendorsByCategory(
  categorySlug: CategorySlug,
  locale: Locale,
  filters: VendorFilters = {},
): Promise<VendorPage> {
  const page = normalizePage(filters.page);
  const where: Prisma.VendorWhereInput = {
    isPublished: true,
    category: categorySlug,
    ...marzWhere(filters.marz),
  };
  const [rows, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: DEFAULT_ORDER,
      select: vendorSelect,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vendor.count({ where }),
  ]);
  return {
    vendors: rows.map((r) => toVendor(r, locale)),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export const getVendor = cache(
  async (categorySlug: CategorySlug, slug: string, locale: Locale): Promise<Vendor | undefined> => {
    const row = await prisma.vendor.findFirst({
      where: { slug, isPublished: true, category: categorySlug },
      select: vendorSelect,
    });
    return row ? toVendor(row, locale) : undefined;
  },
);

export type CatalogFilters = {
  marz?: string;
  categories?: string;
  query?: string;
  page?: number;
};

const SEARCH_FIELDS = [
  "nameHy",
  "nameRu",
  "nameEn",
  "descriptionHy",
  "descriptionRu",
  "descriptionEn",
] as const satisfies (keyof Prisma.VendorWhereInput)[];

export async function getCatalogVendors(locale: Locale, filters: CatalogFilters = {}): Promise<VendorPage> {
  const page = normalizePage(filters.page);
  const query = normalizeQuery(filters.query);
  const where: Prisma.VendorWhereInput = {
    isPublished: true,
    ...marzWhere(filters.marz),
    ...categoriesWhere(filters.categories),
    ...(query
      ? {
          OR: SEARCH_FIELDS.map((field) => ({ [field]: { contains: query, mode: "insensitive" } })),
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: DEFAULT_ORDER,
      select: vendorSelect,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vendor.count({ where }),
  ]);
  return {
    vendors: rows.map((r) => toVendor(r, locale)),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getVendorPaths(): Promise<{ category: CategorySlug; slug: string }[]> {
  const rows = await prisma.vendor.findMany({
    where: { isPublished: true },
    select: { slug: true, category: true },
  });
  return rows.map((r) => ({ category: r.category, slug: r.slug }));
}
