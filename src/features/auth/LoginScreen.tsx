import { getLocale, getTranslations } from "next-intl/server";
import { CircleAlert } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { SignInOptions } from "./SignInOptions";
import { LegalNote } from "./LegalNote";

export type LoginError = "google" | "link";

// Signing in and signing up are the same step: without passwords, the first sign-in creates the
// account, and the role is asked right after it on the signup page.
export async function LoginScreen({ error }: { error: LoginError | null }) {
  const [t, locale] = await Promise.all([getTranslations("Auth"), getLocale()]);

  return (
    <AuthShell
      eyebrow={t("login.eyebrow")}
      title={t("login.title")}
      description={t("login.description")}
      imageAlt={t("imageAlt")}
      caption={t("caption")}
    >
      <div className="flex flex-col gap-8">
        {error && (
          <p
            role="alert"
            className="flex items-start gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {t(`login.errors.${error}`)}
          </p>
        )}
        <SignInOptions locale={locale} />
        <LegalNote />
      </div>
    </AuthShell>
  );
}
