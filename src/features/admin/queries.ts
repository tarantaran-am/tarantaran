import "server-only";
import { prisma } from "@/shared/lib/db";
import { requireAdmin } from "@/features/admin/auth/dal";

const DAY_MS = 24 * 60 * 60 * 1000;

export type DashboardStats = {
  vendors: { published: number; total: number };
  leads: { week: number; month: number };
  contactReveals: { week: number; month: number };
};

export async function getDashboardStats(now = new Date()): Promise<DashboardStats> {
  await requireAdmin();
  const since = (days: number) => ({ gte: new Date(now.getTime() - days * DAY_MS) });

  const [published, total, leadsWeek, leadsMonth, revealsWeek, revealsMonth] = await Promise.all([
    prisma.vendor.count({ where: { isPublished: true } }),
    prisma.vendor.count(),
    prisma.vendorLead.count({ where: { createdAt: since(7) } }),
    prisma.vendorLead.count({ where: { createdAt: since(30) } }),
    prisma.contactEvent.count({ where: { kind: "reveal", createdAt: since(7) } }),
    prisma.contactEvent.count({ where: { kind: "reveal", createdAt: since(30) } }),
  ]);

  return {
    vendors: { published, total },
    leads: { week: leadsWeek, month: leadsMonth },
    contactReveals: { week: revealsWeek, month: revealsMonth },
  };
}
