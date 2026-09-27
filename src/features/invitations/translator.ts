import { createTranslator, type AbstractIntlMessages } from "next-intl";

// The invitation speaks its own language, whatever the site's locale is, and renders both on the
// server and in the builder's live preview: it gets its "Invitation" messages passed in and builds
// a translator from them. The project's messages are untyped, hence the plain string keys.
export type InvitationMessages = AbstractIntlMessages;
export type InvitationTranslator = (key: string, values?: Record<string, string | number>) => string;

export function invitationTranslator(language: string, messages: InvitationMessages): InvitationTranslator {
  const t = createTranslator({ locale: language, messages: { Invitation: messages } }) as unknown as (
    key: string,
    values?: Record<string, string | number>,
  ) => string;
  return (key, values) => t(`Invitation.${key}`, values);
}
