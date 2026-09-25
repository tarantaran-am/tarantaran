import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/db";
import { requireAdmin } from "@/features/admin/auth/dal";
import { periodStart, type Period } from "@/features/admin/periods";

export type LeadListFilters = { vendorId: string; period: Period; page: number };

export const LEADS_PAGE_SIZE = 50;

const vendorSummary = { select: { id: true, nameRu: true, slug: true, category: true } } as const;

export async function listLeads({ vendorId, period, page }: LeadListFilters, now = new Date()) {
  await requireAdmin();

  const since = periodStart(period, now);
  const where: Prisma.VendorLeadWhereInput = {
    ...(vendorId ? { vendorId } : {}),
    ...(since ? { createdAt: { gte: since } } : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.vendorLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LEADS_PAGE_SIZE,
      take: LEADS_PAGE_SIZE,
      include: { vendor: vendorSummary },
    }),
    prisma.vendorLead.count({ where }),
  ]);
  return { leads, total, totalPages: Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE)) };
}

export async function getLead(id: string) {
  await requireAdmin();
  return prisma.vendorLead.findUnique({ where: { id }, include: { vendor: vendorSummary } });
}

export async function listVendorChoices() {
  await requireAdmin();
  return prisma.vendor.findMany({ orderBy: { nameRu: "asc" }, select: { id: true, nameRu: true } });
}
