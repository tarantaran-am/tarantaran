import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";

export async function Inspiration() {
  const t = await getTranslations("Inspiration");

  return (
    <section className="bg-muted py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 aspect-[4/3] overflow-hidden bg-muted lg:order-1">
            <Image
              src="/backgrounds/inspiration.jpg"
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute right-0 bottom-0 hidden aspect-[3/4] w-40 overflow-hidden border-4 border-muted sm:block md:w-52">
              <Image
                src="/backgrounds/inspiration-1.jpg"
                alt={t("bouquetAlt")}
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Eyebrow className="mb-6">{t("eyebrow")}</Eyebrow>
            <h2 className="mb-8 font-serif text-[length:var(--text-section)] leading-[1.1] text-foreground">
              {t("title")}
            </h2>
            <p className="mb-8 max-w-[420px] text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
