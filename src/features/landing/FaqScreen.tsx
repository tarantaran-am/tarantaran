import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { JsonLd } from "@/shared/components/JsonLd";
import { PageHeader } from "@/shared/components/PageHeader";
import { buttonVariants } from "@/shared/components/ui/button";
import { WHATSAPP_URL } from "@/shared/config/site";

const SECTIONS = [
  {
    key: "couples",
    items: ["cost", "contact", "afterRequest", "noReply", "booking", "vetting", "regions", "discount", "data"],
  },
  { key: "vendors", items: ["join", "price", "leads", "edit", "advertising", "stats"] },
] as const;

const linkClass = "text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground";

// Tags the answers may use to link to other pages.
const answerLinks = {
  catalog: (chunks: ReactNode) => (
    <Link href="/catalog" className={linkClass}>
      {chunks}
    </Link>
  ),
  contacts: (chunks: ReactNode) => (
    <Link href="/contacts" className={linkClass}>
      {chunks}
    </Link>
  ),
  privacy: (chunks: ReactNode) => (
    <Link href="/privacy" className={linkClass}>
      {chunks}
    </Link>
  ),
  advertise: (chunks: ReactNode) => (
    <Link href="/for-vendors" className={linkClass}>
      {chunks}
    </Link>
  ),
  whatsapp: (chunks: ReactNode) => (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {chunks}
    </a>
  ),
};

const stripTags = (text: string) => text.replace(/<\/?[a-z]+>/g, "");

export async function FaqScreen() {
  const t = await getTranslations("FaqPage");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SECTIONS.flatMap(({ key, items }) =>
      items.map((item) => ({
        "@type": "Question",
        name: t(`sections.${key}.items.${item}.q`),
        acceptedAnswer: { "@type": "Answer", text: stripTags(t.raw(`sections.${key}.items.${item}.a`) as string) },
      })),
    ),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <Container className="pb-24 md:pb-32">
        <div className="flex flex-col gap-20 md:gap-28">
          {SECTIONS.map(({ key, items }) => (
            <section
              key={key}
              className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:gap-24"
            >
              <div className="lg:sticky lg:top-28 lg:self-start">
                <Eyebrow className="mb-4">{t(`sections.${key}.eyebrow`)}</Eyebrow>
                <h2 className="font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">
                  {t(`sections.${key}.title`)}
                </h2>
              </div>

              <div className="border-b border-border">
                {items.map((item) => (
                  <details key={item} className="group border-t border-border">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-[15px] font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                      <span>{t(`sections.${key}.items.${item}.q`)}</span>
                      <Plus
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                      />
                    </summary>
                    <p className="max-w-2xl pr-10 pb-6 text-sm leading-relaxed text-muted-foreground">
                      {t.rich(`sections.${key}.items.${item}.a`, answerLinks)}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-6 rounded-[20px] bg-muted p-8 md:mt-28 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="mb-2 font-serif text-2xl text-foreground">{t("cta.title")}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("cta.desc")}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
              {t("cta.whatsapp")}
            </a>
            <Link href="/contacts" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("cta.contacts")}
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
