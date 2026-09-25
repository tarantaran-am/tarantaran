import "server-only";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/db";
import { CATEGORIES, isCategory } from "@/shared/config/category";
import { MARZES } from "@/shared/config/marz";
import { SOCIAL_NETWORKS } from "@/shared/config/social";
import { requireAdmin } from "@/features/admin/auth/dal";
import type { VendorFormValues } from "./schema";

export type VendorStatusFilter = "all" | "published" | "hidden";

export type VendorListFilters = { query: string; category: string; status: VendorStatusFilter };

export async function listVendors({ query, category, status }: VendorListFilters) {
  await requireAdmin();

  const where: Prisma.VendorWhereInput = {
    ...(isCategory(category) ? { category } : {}),
    ...(status === "published" ? { isPublished: true } : status === "hidden" ? { isPublished: false } : {}),
    ...(query
      ? {
          OR: [
            { nameRu: { contains: query, mode: "insensitive" } },
            { nameHy: { contains: query, mode: "insensitive" } },
            { nameEn: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return prisma.vendor.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      nameRu: true,
      category: true,
      isPublished: true,
      marzes: true,
      _count: { select: { photos: true, leads: true } },
    },
  });
}

export async function getVendorFormValues(id: string): Promise<{ values: VendorFormValues; slug: string } | null> {
  await requireAdmin();

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return null;

  return {
    slug: vendor.slug,
    values: {
      slug: vendor.slug,
      nameRu: vendor.nameRu,
      nameHy: vendor.nameHy ?? "",
      nameEn: vendor.nameEn ?? "",
      descriptionRu: vendor.descriptionRu,
      descriptionHy: vendor.descriptionHy ?? "",
      descriptionEn: vendor.descriptionEn ?? "",
      category: vendor.category,
      phone: vendor.phone,
      address: vendor.address ?? "",
      marzes: vendor.marzes,
      isPublished: vendor.isPublished,
      ...(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, vendor[network] ?? ""])) as Record<
        (typeof SOCIAL_NETWORKS)[number],
        string
      >),
    },
  };
}

export async function getVendorPhotos(vendorId: string) {
  await requireAdmin();
  const photos = await prisma.photo.findMany({
    where: { vendorId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, blobUrl: true, isCover: true, isApproved: true },
  });
  return photos.map(({ blobUrl, ...photo }) => ({ ...photo, url: blobUrl }));
}

// Russian labels from the site's own translations, so the admin and the site never disagree.
export async function getVendorOptions() {
  const [tCategory, tMarz] = await Promise.all([
    getTranslations({ locale: "ru", namespace: "Category" }),
    getTranslations({ locale: "ru", namespace: "Marz" }),
  ]);
  return {
    categories: CATEGORIES.map((value) => ({ value, label: tCategory(`${value}.name`) })),
    marzes: MARZES.map((value) => ({ value, label: tMarz(value) })),
  };
}

export type VendorOptions = Awaited<ReturnType<typeof getVendorOptions>>;
