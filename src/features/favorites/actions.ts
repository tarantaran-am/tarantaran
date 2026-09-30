"use server";

import { requireAccount } from "@/features/auth/dal";
import { prisma } from "@/shared/lib/db";
import { saveFavorite } from "./save";

// Only couples keep favorites; the heart is not shown to vendors.
async function requireCouple() {
  const account = await requireAccount();
  if (account.role !== "couple") throw new Error("Favorites are for couples");
  return account;
}

export async function addFavorite(vendorId: string): Promise<void> {
  const account = await requireCouple();
  await saveFavorite(account.id, vendorId);
}

export async function removeFavorite(vendorId: string): Promise<void> {
  const account = await requireCouple();
  await prisma.favorite.deleteMany({ where: { accountId: account.id, vendorId } });
}
