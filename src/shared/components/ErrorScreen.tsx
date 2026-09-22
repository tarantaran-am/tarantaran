"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/shared/components/PageHeader";
import { Container } from "@/shared/components/container";
import { buttonVariants } from "@/shared/components/ui/button";

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("ErrorPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <Container className="flex gap-4 pb-24 md:pb-32">
        <button onClick={onRetry} className={buttonVariants()}>
          {t("retry")}
        </button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          {t("home")}
        </Link>
      </Container>
    </>
  );
}
