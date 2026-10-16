"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/shared/components/ui/button";
import { useAuthHint } from "@/shared/lib/use-auth-hint";
import { rememberSignupRole } from "@/features/auth/RememberSignupRole";
import { cn } from "cn";

// "List your business": signing in as a vendor for a guest, the application in the account for a
// vendor. The page is static, so who is signed in is only known in the browser, from the cookies.
export function StartButton({ className }: { className?: string }) {
  const t = useTranslations("ForVendorsPage.start");
  const auth = useAuthHint();
  const classes = cn(buttonVariants({ size: "lg" }), className);

  if (auth === "vendor") {
    return (
      <Link href="/account" className={classes}>
        {t("openAccount")}
      </Link>
    );
  }
  if (auth === "couple") {
    return <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{t("coupleAccount")}</p>;
  }
  // Signed in, but the role step is still ahead: it opens with "vendor" picked.
  if (auth === "member") {
    return (
      <Link href="/signup" onClick={() => rememberSignupRole("vendor")} className={classes}>
        {t("cta")}
      </Link>
    );
  }
  return (
    <Link href={{ pathname: "/login", query: { as: "vendor" } }} className={classes}>
      {t("cta")}
    </Link>
  );
}
