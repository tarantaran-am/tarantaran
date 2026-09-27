"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { requireAccount } from "@/features/auth/dal";
import { Prisma, type Invitation } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/db";
import { isPhotoExtension } from "@/shared/lib/photo/limits";
import { bucketStorage } from "@/shared/lib/storage";
import { MAX_DRAFTS, invitationContentSchema, startsAt, type InvitationDraft, type InvitationField } from "./content";
import { slugCandidates } from "./slug";

const storage = bucketStorage("invitations");

export type SaveResult = { id: string } | { error: "invalid"; invalid: InvitationField[] } | { error: "limit" };

// The invitation, if it belongs to the signed-in account; anything else looks like it doesn't exist.
async function ownInvitation(id: string): Promise<Invitation> {
  const account = await requireAccount();
  const invitation = await prisma.invitation.findFirst({ where: { id, accountId: account.id } });
  if (!invitation) throw new Error("Invitation not found");
  return invitation;
}

// "layout" takes the share image under the page along with it, so the link preview updates too.
function refreshPublicPage(invitation: Pick<Invitation, "slug">) {
  if (invitation.slug) revalidatePath(`/i/${invitation.slug}`, "layout");
}

export async function saveInvitation(id: string | null, draft: InvitationDraft): Promise<SaveResult> {
  const account = await requireAccount();
  const parsed = invitationContentSchema.safeParse(draft);
  if (!parsed.success) {
    return { error: "invalid", invalid: [...new Set(parsed.error.issues.map((i) => i.path[0] as InvitationField))] };
  }
  const { date, time, rsvpDeadline, ...content } = parsed.data;
  const data = {
    ...content,
    venueAddress: content.venueAddress ?? null,
    mapUrl: content.mapUrl ?? null,
    dressCode: content.dressCode ?? null,
    message: content.message ?? null,
    startsAt: startsAt({ date, time }),
    rsvpDeadline: rsvpDeadline ? new Date(`${rsvpDeadline}T00:00:00Z`) : null,
  };

  if (id) {
    const invitation = await ownInvitation(id);
    await prisma.invitation.update({ where: { id: invitation.id }, data });
    refreshPublicPage(invitation);
    return { id: invitation.id };
  }

  if ((await prisma.invitation.count({ where: { accountId: account.id } })) >= MAX_DRAFTS) return { error: "limit" };
  const created = await prisma.invitation.create({ data: { ...data, accountId: account.id }, select: { id: true } });
  return { id: created.id };
}

// One live invitation per account: publishing one takes down the one that was live before. The address
// is given once, on the first publish, and kept afterwards: by then it is in guests' chats.
export async function publishInvitation(id: string): Promise<{ slug: string } | { error: "blocked" }> {
  const invitation = await ownInvitation(id);
  if (invitation.isBlocked) return { error: "blocked" };

  const previous = await prisma.invitation.findMany({
    where: { accountId: invitation.accountId, isPublished: true, NOT: { id } },
    select: { slug: true },
  });
  for (const slug of invitation.slug ? [invitation.slug] : addressesToTry(invitation)) {
    if (!invitation.slug && (await prisma.invitation.findUnique({ where: { slug }, select: { id: true } }))) continue;
    try {
      await prisma.$transaction([
        prisma.invitation.updateMany({
          where: { accountId: invitation.accountId, NOT: { id } },
          data: { isPublished: false },
        }),
        prisma.invitation.update({ where: { id }, data: { isPublished: true, slug } }),
      ]);
    } catch (error) {
      // Someone took this address between the check and the write: go on to the next one.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
    previous.forEach(refreshPublicPage);
    refreshPublicPage({ slug });
    return { slug };
  }
  throw new Error("No free address for the invitation");
}

// The eight name-based addresses, then, if every one of them is taken, the first with a number.
function* addressesToTry(invitation: Pick<Invitation, "partnerOne" | "partnerTwo">) {
  const candidates = slugCandidates(invitation.partnerOne, invitation.partnerTwo);
  yield* candidates;
  for (let n = 2; n < 100; n++) yield `${candidates[0]}-${n}`;
}

export async function unpublishInvitation(id: string): Promise<void> {
  const invitation = await ownInvitation(id);
  await prisma.invitation.update({ where: { id }, data: { isPublished: false } });
  refreshPublicPage(invitation);
}

export async function deleteInvitation(id: string): Promise<void> {
  const invitation = await ownInvitation(id);
  await prisma.invitation.delete({ where: { id } });
  await removePhotoFile(invitation.photoUrl);
  refreshPublicPage(invitation);
}

// Photos go straight from the browser to Storage by a signed URL, then get attached here. Each file has
// a fresh name, so a replaced photo can't hide behind a CDN cache of the old one.
export async function requestInvitationPhotoUpload(
  id: string,
  extension: string,
): Promise<{ path: string; uploadUrl: string } | { error: "format" }> {
  const invitation = await ownInvitation(id);
  if (!isPhotoExtension(extension)) return { error: "format" };
  const path = `${invitation.id}/${randomUUID()}.${extension}`;
  return { path, uploadUrl: await storage.createSignedUploadUrl(path) };
}

export async function setInvitationPhoto(
  id: string,
  path: string,
): Promise<{ photoUrl: string } | { error: "upload" }> {
  const invitation = await ownInvitation(id);
  const expected = new RegExp(`^${invitation.id}/[0-9a-f-]{36}\\.(webp|jpg)$`);
  if (!expected.test(path) || !(await storage.objectExists(path))) return { error: "upload" };

  const photoUrl = storage.publicUrl(path);
  await prisma.invitation.update({ where: { id }, data: { photoUrl } });
  await removePhotoFile(invitation.photoUrl);
  refreshPublicPage(invitation);
  return { photoUrl };
}

export async function removeInvitationPhoto(id: string): Promise<void> {
  const invitation = await ownInvitation(id);
  await prisma.invitation.update({ where: { id }, data: { photoUrl: null } });
  await removePhotoFile(invitation.photoUrl);
  refreshPublicPage(invitation);
}

// Called after the database change has been made: a file left behind in Storage is harmless, so a
// Storage failure is reported rather than turned into a failed action.
async function removePhotoFile(photoUrl: string | null) {
  const path = photoUrl && storage.pathFromPublicUrl(photoUrl);
  if (path) await storage.removeObjects([path]).catch(Sentry.captureException);
}
