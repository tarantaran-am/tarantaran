import { getTranslations } from "next-intl/server";
import { Container } from "@/shared/components/container";
import { SectionTitle } from "@/shared/components/SectionTitle";
import { buttonVariants } from "@/shared/components/ui/button";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/shared/config/site";

const FORMAT_KEYS = ["article", "mention", "banner"] as const;

export async function AdvertiseSection() {
  const t = await getTranslations("Advertise");
  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsappText"))}`;

  return (
    <section className="border-t border-border py-24 md:py-32">
      <Container>
        <SectionTitle
          className="mb-14 max-w-lg"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="grid grid-cols-1 gap-10 border-b border-border pb-16 md:grid-cols-3">
          {FORMAT_KEYS.map((key) => (
            <div key={key}>
              <h3 className="mb-3 text-[15px] font-medium text-foreground">{t(`formats.${key}.title`)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`formats.${key}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
            {t("whatsapp")}
          </a>
          <p className="text-sm text-muted-foreground">
            {t.rich("email", {
              email: CONTACT_EMAIL,
              link: (chunks) => (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </Container>
    </section>
  );
}
