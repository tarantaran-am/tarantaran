import "server-only";
import { cookies } from "next/headers";
import type { AccountRole } from "@/generated/prisma/enums";
import { prisma } from "@/shared/lib/db";
import { PENDING_FAVORITE_COOKIE, parsePendingFavorite } from "./pending";

// A repeated heart press keeps the one row. An unknown id finds no vendor: ids are plain text.
export async function saveFavorite(accountId: string, vendorId: string): Promise<void> {
  const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, isPublished: true }, select: { id: true } });
  if (!vendor) return;
  await prisma.favorite.createMany({ data: [{ accountId, vendorId }], skipDuplicates: true });
}

// Right after signing in with an account: saves the heart pressed before it, if any, and returns the
// page to go back to. Only couples keep favorites; for a vendor the heart is just dropped.
export async function savePendingFavorite(accountId: string, role: AccountRole): Promise<string | null> {
  const store = await cookies();
  const pending = parsePendingFavorite(store.get(PENDING_FAVORITE_COOKIE)?.value);
  store.delete(PENDING_FAVORITE_COOKIE);
  if (!pending || role !== "couple") return null;
  await saveFavorite(accountId, pending.vendorId);
  return pending.returnTo;
}
