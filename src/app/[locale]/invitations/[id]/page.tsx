import { notFound } from "next/navigation";
import { requireAccount } from "@/features/auth/dal";
import { BuilderScreen } from "@/features/invitations/BuilderScreen";
import { splitStartsAt, type InvitationLanguage } from "@/features/invitations/content";
import { getOwnInvitation } from "@/features/invitations/queries";

export { generateMetadata } from "@/features/invitations/metadata";

export default async function EditInvitationPage(props: PageProps<"/[locale]/invitations/[id]">) {
  const [account, { id }] = await Promise.all([requireAccount(), props.params]);
  const invitation = await getOwnInvitation(id, account.id);
  if (!invitation) notFound();

  return (
    <BuilderScreen
      signedIn
      photoUrl={invitation.photoUrl ?? undefined}
      saved={{
        id: invitation.id,
        slug: invitation.slug,
        isPublished: invitation.isPublished,
        isBlocked: invitation.isBlocked,
      }}
      initial={{
        template: invitation.template,
        language: invitation.language as InvitationLanguage,
        partnerOne: invitation.partnerOne,
        partnerTwo: invitation.partnerTwo,
        ...splitStartsAt(invitation.startsAt),
        venueName: invitation.venueName,
        venueAddress: invitation.venueAddress ?? "",
        mapUrl: invitation.mapUrl ?? "",
        schedule: invitation.schedule as { time: string; title: string }[],
        dressCode: invitation.dressCode ?? "",
        message: invitation.message ?? "",
        rsvpDeadline: invitation.rsvpDeadline?.toISOString().slice(0, 10) ?? "",
      }}
    />
  );
}
