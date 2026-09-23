import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/PageHeader";
import { ProseSection } from "@/shared/components/ProseSection";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { CTA } from "@/features/landing/CTA";
import { AdvertiseSection } from "@/features/advertise/AdvertiseSection";
import { getPublishedVendorCount } from "@/shared/lib/queries";
import { getCategories } from "@/shared/lib/categories";

const WHY_KEYS = ["portfolio", "direct", "vetted"] as const;

export async function AboutScreen() {
  const t = await getTranslations("AboutPage");
  const tHero = await getTranslations("Hero");
  const [categories, vendorCount] = await Promise.all([getCategories(), getPublishedVendorCount()]);

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <Container className="pb-16 md:pb-20">
        <div className="flex flex-wrap gap-10 border-t border-border pt-8 md:gap-16">
          <Stat value={vendorCount} label={tHero("stats.vendors")} />
          <Stat value={categories.length} label={tHero("stats.categories")} />
          <Stat value={tHero("stats.cityName")} label={tHero("stats.cityLabel")} />
        </div>
      </Container>

      <ProseSection>
        <p>{t("story.p1")}</p>
        <p>{t("story.p2")}</p>
      </ProseSection>

      <HowItWorks />

      <section className="border-t border-border py-24 md:py-32">
        <Container>
          <div className="mb-14 max-w-lg">
            <Eyebrow className="mb-4">{t("why.eyebrow")}</Eyebrow>
            <h2 className="font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">
              {t("why.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 border-b border-border pb-16 md:grid-cols-3">
            {WHY_KEYS.map((key) => (
              <div key={key}>
                <h3 className="mb-3 text-[15px] font-medium text-foreground">{t(`why.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`why.${key}.desc`)}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("roadmap")}</p>
        </Container>
      </section>

      <AdvertiseSection />

      <CTA />
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl leading-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
