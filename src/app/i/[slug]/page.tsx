import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationPage } from "@/features/invitations/InvitationPage";
import { RsvpForm } from "@/features/invitations/RsvpForm";
import {
  getPublishedInvitation,
  invitationMessages,
  isAcceptingAnswers,
  isAfterWedding,
} from "@/features/invitations/queries";
import { THEMES } from "@/features/invitations/themes";
import { invitationTranslator } from "@/features/invitations/translator";
import { formatWeddingDate, viewFromInvitation } from "@/features/invitations/view";
import { SITE_URL } from "@/shared/config/seo";
import { BRAND } from "@/shared/config/site";

// Edits, publishing and takedowns revalidate the page; the hour only moves the countdown's
// starting point and the switch to "thank you" after the wedding.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const invitation = await getPublishedInvitation((await params).slug);
  if (!invitation) return {};
  const view = viewFromInvitation(invitation);
  const t = invitationTranslator(view.language, await invitationMessages(view.language));
  const title = `${view.partnerOne} ${t("and")} ${view.partnerTwo}`;
  return {
    title,
    description: `${formatWeddingDate(view.startsAt, view.language).date} · ${view.venueName}`,
    openGraph: { title, url: `${SITE_URL}/i/${invitation.slug}`, type: "website", siteName: BRAND },
  };
}

export default async function InvitationRoute({ params }: PageProps<"/i/[slug]">) {
  const invitation = await getPublishedInvitation((await params).slug);
  if (!invitation?.slug) notFound();

  const view = viewFromInvitation(invitation);
  const messages = await invitationMessages(view.language);
  const t = invitationTranslator(view.language, messages);
  const isPast = isAfterWedding(invitation);

  return (
    <InvitationPage
      view={view}
      messages={messages}
      isPast={isPast}
      rsvp={
        <RsvpForm
          slug={invitation.slug}
          view={view}
          messages={messages}
          theme={THEMES[view.template]}
          closed={!isAcceptingAnswers(invitation)}
        />
      }
      footer={
        <a href={SITE_URL} className="underline-offset-4 hover:underline">
          {t("madeWith")}
        </a>
      }
    />
  );
}
