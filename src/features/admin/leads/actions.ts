"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/db";
import { requireAdmin } from "@/features/admin/auth/dal";

// For requests to erase personal data (see the privacy policy): the lead goes for good.
export async function deleteLead(leadId: string): Promise<void> {
  await requireAdmin();
  await prisma.vendorLead.deleteMany({ where: { id: leadId } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect("/admin/leads");
}
