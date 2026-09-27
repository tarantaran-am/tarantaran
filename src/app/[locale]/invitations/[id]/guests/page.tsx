import { notFound } from "next/navigation";
import { requireAccount } from "@/features/auth/dal";
import { GuestsScreen } from "@/features/invitations/GuestsScreen";
import { getOwnInvitation } from "@/features/invitations/queries";
import { prisma } from "@/shared/lib/db";

export { generateMetadata } from "@/features/invitations/metadata";

export default async function InvitationGuestsPage(props: PageProps<"/[locale]/invitations/[id]/guests">) {
  const [account, { id }] = await Promise.all([requireAccount(), props.params]);
  const invitation = await getOwnInvitation(id, account.id);
  if (!invitation) notFound();
  const rsvps = await prisma.rsvp.findMany({ where: { invitationId: invitation.id }, orderBy: { createdAt: "desc" } });
  return <GuestsScreen invitation={invitation} rsvps={rsvps} />;
}
