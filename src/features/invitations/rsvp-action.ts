"use server";

import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { clientIp } from "@/shared/lib/client-ip";
import { prisma } from "@/shared/lib/db";
import { saltedHash } from "@/shared/lib/salted-hash";
import { MAX_GUESTS } from "./content";
import { getPublishedInvitation, isAcceptingAnswers } from "./queries";

export type RsvpState = { status: "idle" | "sent" | "invalid" | "limited" | "closed" | "error" };

// Per visitor and invitation: a family answering for each member fits, a script does not.
const LIMIT = { max: 15, windowMs: 60 * 60 * 1000 };

const schema = z.discriminatedUnion("attending", [
  z.object({
    name: z.string().trim().min(1).max(80),
    attending: z.literal("yes"),
    guests: z.coerce.number().int().min(1).max(MAX_GUESTS),
    comment: z.string().trim().max(500),
  }),
  z.object({
    name: z.string().trim().min(1).max(80),
    attending: z.literal("no"),
    comment: z.string().trim().max(500),
  }),
]);

export async function submitRsvp(slug: string, _previous: RsvpState, formData: FormData): Promise<RsvpState> {
  // Honeypot: people never see this field, form-filling bots do. Pretend it worked.
  if (formData.get("website")) return { status: "sent" };

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    attending: formData.get("attending") ?? "",
    guests: formData.get("guests") ?? "1",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { status: "invalid" };

  try {
    const invitation = await getPublishedInvitation(slug);
    if (!invitation || !isAcceptingAnswers(invitation)) return { status: "closed" };

    const visitorHash = saltedHash(clientIp(await headers()));
    const recent = await prisma.rsvp.count({
      where: { invitationId: invitation.id, visitorHash, createdAt: { gte: new Date(Date.now() - LIMIT.windowMs) } },
    });
    if (recent >= LIMIT.max) return { status: "limited" };

    const answer = parsed.data;
    await prisma.rsvp.create({
      data: {
        invitationId: invitation.id,
        name: answer.name,
        attending: answer.attending === "yes",
        guests: answer.attending === "yes" ? answer.guests : 0,
        comment: answer.comment || null,
        visitorHash,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return { status: "error" };
  }
  return { status: "sent" };
}
