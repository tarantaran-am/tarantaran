import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/shared/components/ui/button";
import { AuthShell } from "./AuthShell";

// Where a sign-in email leads. Signing in waits for this click, so a mail scanner that opens
// the link on its own does not use up the single-use token.
export async function ConfirmScreen({ tokenHash }: { tokenHash: string }) {
  const [t, locale] = await Promise.all([getTranslations("Auth"), getLocale()]);

  return (
    <AuthShell
      eyebrow={t("confirm.eyebrow")}
      title={t("confirm.title")}
      description={t("confirm.description")}
      imageAlt={t("imageAlt")}
      caption={t("caption")}
    >
      <form method="post" action="/api/auth/confirm">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" size="lg" className="h-12 w-full text-[15px]">
          {t("confirm.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
