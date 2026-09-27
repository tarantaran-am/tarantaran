import { getTranslations } from "next-intl/server";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { InvitationBuilder, type SavedInvitation } from "./InvitationBuilder";
import type { InvitationDraft } from "./content";
import { allInvitationMessages } from "./queries";

export async function BuilderScreen({
  initial,
  saved,
  photoUrl,
  signedIn,
}: {
  initial: InvitationDraft;
  saved?: SavedInvitation;
  photoUrl?: string;
  signedIn: boolean;
}) {
  const [t, messagesByLanguage] = await Promise.all([getTranslations("Invitations"), allInvitationMessages()]);
  return (
    <div className="pt-16 md:pt-[68px]">
      <Container className="py-10 md:py-14">
        <Eyebrow className="mb-3">{t("metaTitle")}</Eyebrow>
        <h1 className="mb-8 font-serif text-[length:var(--text-page)] leading-[1.1] text-foreground">
          {saved ? t("editTitle") : t("newTitle")}
        </h1>
        <InvitationBuilder
          initial={initial}
          saved={saved}
          photoUrl={photoUrl}
          signedIn={signedIn}
          messagesByLanguage={messagesByLanguage}
        />
      </Container>
    </div>
  );
}
