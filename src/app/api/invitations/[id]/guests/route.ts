import { getAccount } from "@/features/auth/dal";
import { getOwnInvitation } from "@/features/invitations/queries";
import { prisma } from "@/shared/lib/db";

// A cell as spreadsheets expect it: quoted, and never starting with = + - @ that Excel would run as a formula.
function cell(value: string | number): string {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

// The guest list for the couple to keep, e.g. before it is removed six months after the wedding.
export async function GET(_request: Request, { params }: RouteContext<"/api/invitations/[id]/guests">) {
  const account = await getAccount();
  const invitation = account && (await getOwnInvitation((await params).id, account.id));
  if (!invitation) return new Response(null, { status: 404 });

  const rsvps = await prisma.rsvp.findMany({ where: { invitationId: invitation.id }, orderBy: { createdAt: "asc" } });
  const rows = [
    ["name", "attending", "guests", "comment", "answered_at"],
    ...rsvps.map((rsvp) => [
      rsvp.name,
      rsvp.attending ? "yes" : "no",
      rsvp.guests,
      rsvp.comment ?? "",
      rsvp.createdAt.toISOString(),
    ]),
  ];
  // A byte order mark, so Excel reads Armenian and Cyrillic names as UTF-8.
  const csv = "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guests-${invitation.slug ?? invitation.id}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
