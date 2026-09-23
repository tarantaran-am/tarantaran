import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CategoryCard } from "@/features/landing/CategoryCard";
import { getVendorCountByCategory } from "@/shared/lib/queries";
import { getCategories } from "@/shared/lib/categories";
import { Container } from "@/shared/components/container";
import { SectionTitle } from "@/shared/components/SectionTitle";

function bentoClassName(indexInCycle: number): string {
  switch (indexInCycle) {
    case 0:
      return "sm:col-start-1 sm:row-span-2";
    case 1:
      return "sm:col-start-2";
    case 2:
      return "sm:col-start-2";
    case 3:
      return "sm:col-start-3 sm:row-span-2";
    default:
      return "";
  }
}

export async function Categories() {
  const [t, categories, counts] = await Promise.all([
    getTranslations("Categories"),
    getCategories(),
    getVendorCountByCategory(),
  ]);

  return (
    <section id="categories" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionTitle className="mb-14 max-w-lg" eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid grid-cols-2 gap-3 sm:grid-flow-row-dense sm:auto-rows-[220px] sm:grid-cols-3 lg:auto-rows-[260px]">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.slug}
              slug={cat.slug}
              name={cat.namePlural}
              count={t("vendorCount", { count: counts[cat.slug] ?? 0 })}
              photo={cat.cover}
              className={`aspect-[3/4] sm:aspect-auto sm:h-full ${bentoClassName(i % 7)}`}
            />
          ))}
        </div>

        <div className="mt-9 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <Link href="/for-vendors" className="group flex items-center gap-2 text-sm text-foreground">
            <span>{t("vendorCta")}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
