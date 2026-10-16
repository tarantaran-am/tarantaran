import { getLocale, getTranslations } from "next-intl/server";
import { AuthShell } from "./AuthShell";
import { RolePicker } from "./RolePicker";
import { peekSignupRole } from "./role-cookie";

// The one step after the first sign-in: couple or vendor.
export async function SignupScreen() {
  const [t, locale, signupRole] = await Promise.all([getTranslations("Auth"), getLocale(), peekSignupRole()]);

  return (
    <AuthShell
      eyebrow={t("signup.eyebrow")}
      title={t("signup.title")}
      description={t("signup.description")}
      imageAlt={t("imageAlt")}
      caption={t("caption")}
    >
      <RolePicker locale={locale} defaultRole={signupRole ?? "couple"} />
    </AuthShell>
  );
}
