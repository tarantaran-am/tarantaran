import type { Invitation } from "@/generated/prisma/client";
import {
  WEDDING_TIME_ZONE,
  invitationContentSchema,
  startsAt,
  type InvitationDraft,
  type InvitationLanguage,
  type InvitationTemplateName,
} from "./content";

// Everything the invitation page shows, from a saved invitation or, in the builder, a draft in progress.
export type InvitationView = {
  template: InvitationTemplateName;
  language: InvitationLanguage;
  partnerOne: string;
  partnerTwo: string;
  /** ISO string, so the view can be passed to client components. */
  startsAt: string;
  venueName: string;
  venueAddress?: string;
  mapUrl?: string;
  schedule: { time: string; title: string }[];
  dressCode?: string;
  message?: string;
  photoUrl?: string;
  rsvpDeadline?: string;
};

export function viewFromInvitation(invitation: Invitation): InvitationView {
  return {
    template: invitation.template,
    language: invitation.language as InvitationLanguage,
    partnerOne: invitation.partnerOne,
    partnerTwo: invitation.partnerTwo,
    startsAt: invitation.startsAt.toISOString(),
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress ?? undefined,
    mapUrl: invitation.mapUrl ?? undefined,
    schedule: invitation.schedule as InvitationView["schedule"],
    dressCode: invitation.dressCode ?? undefined,
    message: invitation.message ?? undefined,
    photoUrl: invitation.photoUrl ?? undefined,
    rsvpDeadline: invitation.rsvpDeadline?.toISOString().slice(0, 10),
  };
}

// The builder previews a draft while it is being filled in, so empty fields fall back to placeholders
// rather than failing validation.
export function viewFromDraft(
  draft: InvitationDraft,
  photoUrl: string | undefined,
  placeholders: { partnerOne: string; partnerTwo: string; venueName: string },
): InvitationView {
  const parsed = invitationContentSchema.safeParse(draft);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(draft.date) ? draft.date : new Date().toISOString().slice(0, 10);
  const time = /^\d{2}:\d{2}$/.test(draft.time) ? draft.time : "16:00";
  const content = parsed.success ? parsed.data : undefined;
  return {
    template: draft.template,
    language: draft.language,
    partnerOne: draft.partnerOne.trim() || placeholders.partnerOne,
    partnerTwo: draft.partnerTwo.trim() || placeholders.partnerTwo,
    startsAt: startsAt({ date, time }).toISOString(),
    venueName: draft.venueName.trim() || placeholders.venueName,
    venueAddress: draft.venueAddress?.trim() || undefined,
    mapUrl: content?.mapUrl,
    schedule: draft.schedule.filter((item) => item.title.trim()),
    dressCode: draft.dressCode?.trim() || undefined,
    message: draft.message?.trim() || undefined,
    photoUrl,
    rsvpDeadline: draft.rsvpDeadline || undefined,
  };
}

export function formatWeddingDate(
  iso: string,
  language: InvitationLanguage,
): { date: string; weekday: string; time: string } {
  const value = new Date(iso);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(language, { timeZone: WEDDING_TIME_ZONE, ...options }).format(value);
  return {
    date: format({ day: "numeric", month: "long", year: "numeric" }),
    weekday: format({ weekday: "long" }),
    time: format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
  };
}

export function formatDay(isoDate: string, language: InvitationLanguage): string {
  return new Intl.DateTimeFormat(language, { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}
