import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const LINK =
  "text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

export async function LegalNote() {
  const t = await getTranslations("Auth");
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {t.rich("legal", {
        terms: (chunks) => (
          <Link href="/terms" className={LINK}>
            {chunks}
          </Link>
        ),
        privacy: (chunks) => (
          <Link href="/privacy" className={LINK}>
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}
