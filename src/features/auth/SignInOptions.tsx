import { getTranslations } from "next-intl/server";
import { env } from "@/env";
import { EmailSignIn } from "./EmailSignIn";
import { GoogleButton } from "./GoogleButton";

// Google, and a sign-in link by email once Turnstile is set up: Supabase refuses email requests
// without a captcha token, so the form stays hidden until there is a site key to get one.
export async function SignInOptions({ locale }: { locale: string }) {
  const t = await getTranslations("Auth");
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <div className="flex flex-col gap-6">
      <GoogleButton locale={locale} label={t("continueWithGoogle")} />
      {siteKey && (
        <>
          <div className="flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>
          <EmailSignIn locale={locale} siteKey={siteKey} />
        </>
      )}
    </div>
  );
}
