import { getLocale } from "next-intl/server";
import { getAccount } from "@/features/auth/dal";
import { BuilderScreen } from "@/features/invitations/BuilderScreen";
import { EMPTY_DRAFT, type InvitationLanguage } from "@/features/invitations/content";
import { staticPageMetadata } from "@/shared/config/seo";

// Unlike a couple's own invitations, the builder is public and indexed: header and footer link to it.
export const generateMetadata = staticPageMetadata("Invitations", "/invitations/new", {
  title: "newMetaTitle",
  description: "newMetaDescription",
});

// Open to guests too: the draft stays in the browser, and signing in is asked only to publish.
// The invitation starts in the language the couple uses the site in.
export default async function NewInvitationPage() {
  const [locale, account] = await Promise.all([getLocale(), getAccount()]);
  return (
    <BuilderScreen initial={{ ...EMPTY_DRAFT, language: locale as InvitationLanguage }} signedIn={Boolean(account)} />
  );
}
