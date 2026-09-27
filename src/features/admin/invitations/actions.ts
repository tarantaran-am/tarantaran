"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/dal";
import { prisma } from "@/shared/lib/db";

// There is no moderation; this is the admin's manual takedown, and the couple can't publish it again.
export async function setInvitationBlocked(id: string, blocked: boolean): Promise<void> {
  await requireAdmin();
  const invitation = await prisma.invitation.update({
    where: { id },
    data: blocked ? { isBlocked: true, isPublished: false } : { isBlocked: false },
    select: { slug: true },
  });
  if (invitation.slug) revalidatePath(`/i/${invitation.slug}`);
  revalidatePath("/admin/invitations");
}
