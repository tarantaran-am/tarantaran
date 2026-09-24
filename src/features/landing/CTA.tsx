import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { buttonVariants } from "@/shared/components/ui/button";
import { Link } from "@/i18n/navigation";

export function CTA() {
  const t = useTranslations("CTA");
  const className = buttonVariants({ variant: "default", size: "lg" });

  return (
    <section className="relative overflow-hidden bg-foreground py-32 md:py-48 dark:bg-card">
      <Image
        src="/backgrounds/cta.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-top opacity-[0.18] dark:opacity-[0.22]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/60 dark:to-card/60" />

      <Container className="relative text-center">
        <Eyebrow className="mb-8 text-background/45 dark:text-foreground/45">{t("eyebrow")}</Eyebrow>
        <h2 className="mx-auto mb-7 max-w-3xl font-serif text-[length:var(--text-hero-cta)] leading-[1.05] text-background dark:text-foreground">
          {t("title")}
        </h2>
        <p className="mx-auto mb-12 max-w-md text-[15px] leading-relaxed text-background/55 dark:text-foreground/60">
          {t("subtitle")}
        </p>
        <Link href="/catalog" className={className}>
          {t("button")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Container>
    </section>
  );
}
