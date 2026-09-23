import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/PageHeader";
import { Container } from "@/shared/components/container";
import { buttonVariants } from "@/shared/components/ui/button";
import { WHATSAPP_URL } from "@/shared/config/site";
import { AdvertiseSection } from "@/features/advertise/AdvertiseSection";

export async function ForVendorsScreen() {
  const t = await getTranslations("ForVendorsPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <Container className="pb-24 md:pb-32">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
          {t("whatsapp")}
        </a>
      </Container>
      <AdvertiseSection />
    </>
  );
}
