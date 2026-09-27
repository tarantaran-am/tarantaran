import "server-only";
import { cache } from "react";
import { prisma } from "@/shared/lib/db";
import { INVITATION_LANGUAGES, type InvitationLanguage } from "./content";
import type { InvitationMessages } from "./translator";

const SLUG = /^[a-z0-9_-]{1,100}$/;

// What guests may open: published and not taken down by an admin.
export const getPublishedInvitation = cache(async (slug: string) => {
  if (!SLUG.test(slug)) return null;
  return prisma.invitation.findFirst({ where: { slug, isPublished: true, isBlocked: false } });
});

export async function invitationMessages(language: InvitationLanguage): Promise<InvitationMessages> {
  return (await import(`../../../messages/${language}.json`)).default.Invitation;
}

// The wedding day is over half a day after the ceremony starts: guests open the page that evening too.
const PAST_AFTER_MS = 12 * 60 * 60 * 1000;

export function isAfterWedding(invitation: { startsAt: Date }, now = new Date()) {
  return now.getTime() > invitation.startsAt.getTime() + PAST_AFTER_MS;
}

// Answers are taken until the deadline the couple set, or until the wedding day itself.
export function isAcceptingAnswers(invitation: { startsAt: Date; rsvpDeadline: Date | null }, now = new Date()) {
  const closesAt = invitation.rsvpDeadline
    ? new Date(invitation.rsvpDeadline.getTime() + 24 * 60 * 60 * 1000)
    : invitation.startsAt;
  return now < closesAt;
}

// The builder previews the invitation in whichever language the couple picks.
export async function allInvitationMessages(): Promise<Record<InvitationLanguage, InvitationMessages>> {
  const entries = await Promise.all(
    INVITATION_LANGUAGES.map(async (language) => [language, await invitationMessages(language)] as const),
  );
  return Object.fromEntries(entries) as Record<InvitationLanguage, InvitationMessages>;
}

// An invitation of the given account, for its owner's pages.
export function getOwnInvitation(id: string, accountId: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  return prisma.invitation.findFirst({ where: { id, accountId } });
}
