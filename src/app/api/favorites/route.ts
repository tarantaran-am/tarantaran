import { getAuthUser } from "@/features/auth/dal";
import { prisma } from "@/shared/lib/db";

// Which hearts to fill. The catalog pages are cached and shared by everyone, so cards ask from the browser.
// Only couples have favorites, so no need to look the account up.
export async function GET() {
  const user = await getAuthUser();
  const rows = user
    ? await prisma.favorite.findMany({ where: { accountId: user.id }, select: { vendorId: true } })
    : [];
  return Response.json({ ids: rows.map((r) => r.vendorId) }, { headers: { "Cache-Control": "private, no-store" } });
}
