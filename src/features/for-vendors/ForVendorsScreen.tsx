import { getTranslations } from "next-intl/server";
import { BarChart3, Inbox, LayoutTemplate, Link2 } from "lucide-react";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { FaqList } from "@/shared/components/FaqList";
import { SectionTitle } from "@/shared/components/SectionTitle";
import { ChatLinks } from "@/shared/components/ChatLinks";
import { AdvertiseSection } from "@/features/advertise/AdvertiseSection";
import { StartButton } from "./StartButton";

const STEPS = ["signIn", "fill", "review"] as const;
const BENEFITS = [
  { key: "page", icon: LayoutTemplate },
  { key: "leads", icon: Inbox },
  { key: "contacts", icon: Link2 },
  { key: "stats", icon: BarChart3 },
] as const;
const FAQ = ["cost", "time", "edit", "noTime", "photos", "categories"] as const;

// The page that sells a listing: the application itself is filled in the account, after signing in.
export async function ForVendorsScreen() {
  const t = await getTranslations("ForVendorsPage");

  return (
    <>
      <div className="pt-16 md:pt-[68px]">
        <Container className="py-16 md:py-24">
          <Eyebrow className="mb-4">{t("eyebrow")}</Eyebrow>
          <h1 className="max-w-3xl font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{t("description")}</p>
          <p className="mt-6 inline-flex rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
            {t("freeBadge")}
          </p>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <StartButton />
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">{t("orMessage")}</span>
              <ChatLinks />
            </div>
          </div>
        </Container>
      </div>

      <section className="border-t border-border py-24 md:py-32">
        <Container>
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
            <SectionTitle eyebrow={t("steps.eyebrow")} title={t("steps.title")} />
            <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((key, index) => (
                <li key={key}>
                  <div className="mb-6 font-serif text-[5rem] leading-none text-muted-foreground select-none">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mb-3 text-[15px] font-medium text-foreground">{t(`steps.${key}.title`)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(`steps.${key}.desc`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <Container>
          <SectionTitle className="mb-14 max-w-lg" eyebrow={t("benefits.eyebrow")} title={t("benefits.title")} />
          <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ key, icon: Icon }) => (
              <li key={key}>
                <span className="mb-5 flex size-11 items-center justify-center rounded-full bg-muted text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mb-3 text-[15px] font-medium text-foreground">{t(`benefits.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`benefits.${key}.desc`)}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <Container>
          <div className="grid grid-cols-1 gap-10 rounded-[28px] bg-muted p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:p-12">
            <div>
              <Eyebrow className="mb-4">{t("pricing.eyebrow")}</Eyebrow>
              <p className="font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">
                {t("pricing.title")}
              </p>
            </div>
            <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>{t("pricing.free")}</p>
              <p>{t("pricing.after")}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <Container>
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]">
            <SectionTitle eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
            <FaqList items={FAQ.map((key) => ({ id: key, question: t(`faq.${key}.q`), answer: t(`faq.${key}.a`) }))} />
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <Container className="flex flex-col items-start gap-8">
          <SectionTitle className="max-w-xl" eyebrow={t("final.eyebrow")} title={t("final.title")} />
          <StartButton />
        </Container>
      </section>

      <AdvertiseSection />
    </>
  );
}
