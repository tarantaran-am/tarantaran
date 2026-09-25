import "server-only";
import { prisma } from "@/shared/lib/db";
import { SOCIAL_NETWORKS, type SocialNetwork } from "@/shared/config/social";
import { requireAdmin } from "@/features/admin/auth/dal";
import { periodStart, type Period } from "@/features/admin/periods";

export type VendorStats = {
  vendor: { id: string; nameRu: string; slug: string; category: string; isPublished: boolean };
  reveals: number;
  clicks: Record<SocialNetwork, number>;
  totalClicks: number;
  leads: number;
};

const emptyClicks = () =>
  Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, 0])) as Record<SocialNetwork, number>;

// Every vendor, busiest first; ones with no activity stay in the list so nobody is forgotten.
export async function getVendorStats(period: Period, now = new Date()): Promise<VendorStats[]> {
  await requireAdmin();
  const since = periodStart(period, now);
  const createdAt = since ? { gte: since } : undefined;

  const [vendors, events, leads] = await Promise.all([
    prisma.vendor.findMany({ select: { id: true, nameRu: true, slug: true, category: true, isPublished: true } }),
    prisma.contactEvent.groupBy({ by: ["vendorId", "kind"], where: { createdAt }, _count: { _all: true } }),
    prisma.vendorLead.groupBy({ by: ["vendorId"], where: { createdAt }, _count: { _all: true } }),
  ]);

  const stats = new Map<string, VendorStats>(
    vendors.map((vendor) => [vendor.id, { vendor, reveals: 0, clicks: emptyClicks(), totalClicks: 0, leads: 0 }]),
  );
  for (const { vendorId, kind, _count } of events) {
    const row = stats.get(vendorId);
    if (!row) continue;
    if (kind === "reveal") {
      row.reveals = _count._all;
    } else {
      row.clicks[kind] = _count._all;
      row.totalClicks += _count._all;
    }
  }
  for (const { vendorId, _count } of leads) {
    const row = stats.get(vendorId);
    if (row) row.leads = _count._all;
  }

  const activity = (row: VendorStats) => row.leads * 10 + row.reveals + row.totalClicks;
  return [...stats.values()].sort(
    (a, b) => activity(b) - activity(a) || a.vendor.nameRu.localeCompare(b.vendor.nameRu),
  );
}
