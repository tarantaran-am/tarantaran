import { getLocale, getTranslations } from "next-intl/server";
import { CircleAlert } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { SignInOptions } from "./SignInOptions";
import { LegalNote } from "./LegalNote";
import { RememberSignupRole } from "./RememberSignupRole";

export type LoginError = "google" | "link";

// Signing in and signing up are the same step: without passwords, the first sign-in creates the
// account, and the role is asked right after it on the signup page. Coming from the page for vendors
// (`asVendor`), the role is known already and the page speaks to vendors.
export async function LoginScreen({ error, asVendor }: { error: LoginError | null; asVendor: boolean }) {
  const [t, locale] = await Promise.all([getTranslations("Auth"), getLocale()]);

  return (
    <AuthShell
      eyebrow={t(asVendor ? "login.vendor.eyebrow" : "login.eyebrow")}
      title={t(asVendor ? "login.vendor.title" : "login.title")}
      description={t(asVendor ? "login.vendor.description" : "login.description")}
      imageAlt={t("imageAlt")}
      caption={t("caption")}
    >
      <div className="flex flex-col gap-8">
        {asVendor && <RememberSignupRole role="vendor" />}
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
