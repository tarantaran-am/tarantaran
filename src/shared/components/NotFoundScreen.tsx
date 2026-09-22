import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/shared/components/PageHeader";
import { Container } from "@/shared/components/container";
import { buttonVariants } from "@/shared/components/ui/button";

export async function NotFoundScreen() {
  const t = await getTranslations("NotFoundPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <Container className="flex gap-4 pb-24 md:pb-32">
        <Link href="/" className={buttonVariants()}>
          {t("home")}
        </Link>
        <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>
          {t("catalog")}
        </Link>
      </Container>
    </>
  );
}
