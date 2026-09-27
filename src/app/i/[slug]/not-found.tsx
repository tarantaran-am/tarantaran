import { invitationMessages } from "@/features/invitations/queries";
import { invitationTranslator } from "@/features/invitations/translator";
import { INVITATION_LANGUAGES } from "@/features/invitations/content";

// The page's language is unknown when there is no invitation, so the message is in all three.
export default async function InvitationNotFound() {
  const texts = await Promise.all(
    INVITATION_LANGUAGES.map(async (language) => {
      const t = invitationTranslator(language, await invitationMessages(language));
      return { language, title: t("unavailable.title"), text: t("unavailable.text") };
    }),
  );
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#faf6f0] px-6 py-16 text-[#2e2724]">
      <div className="flex max-w-sm flex-col gap-8 text-center">
        {texts.map(({ language, title, text }) => (
          <div key={language} lang={language}>
            <h1 className="font-serif text-2xl">{title}</h1>
            <p className="mt-2 text-sm opacity-60">{text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
