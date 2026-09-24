import { useTranslations } from "next-intl";
import { Container } from "@/shared/components/container";
import { SectionTitle } from "@/shared/components/SectionTitle";

const stepKeys = ["step1", "step2", "step3"] as const;
const stepNumbers = ["01", "02", "03"];

export function HowItWorks() {
  const t = useTranslations("HowItWorks");

  return (
    <section className="border-t border-border py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
          <SectionTitle
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titleLine1")}
                <br />
                {t("titleLine2")}
              </>
            }
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {stepKeys.map((key, i) => (
              <div key={key}>
                <div className="mb-6 font-serif text-[5rem] leading-none text-muted-foreground select-none">
                  {stepNumbers[i]}
                </div>
                <h3 className="mb-3 text-[15px] font-medium text-foreground">{t(`${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
