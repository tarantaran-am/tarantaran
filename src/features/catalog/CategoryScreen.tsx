import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { Pagination } from "@/shared/components/Pagination";
import { CategoryVendorList } from "@/features/catalog/CategoryVendorList";
import { getVendorsByCategory } from "@/shared/lib/queries";
import { getCategory } from "@/shared/lib/categories";
import { getRequestLocale } from "@/i18n/locale";

type SearchParams = Record<string, string | string[] | undefined>;

export async function CategoryScreen({
  categorySlug,
  searchParams,
}: {
  categorySlug: string;
  searchParams: SearchParams;
}) {
  const lang = await getRequestLocale();
  const tCrumbs = await getTranslations("Breadcrumbs");

  const category = await getCategory(categorySlug);
  if (!category) notFound();

  const { marz = "", page = "" } = searchParams;
  const filters = {
    marz: typeof marz === "string" ? marz : "",
    page: Number(page) || 1,
  };

  const { vendors, totalPages } = await getVendorsByCategory(category.slug, lang, filters);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (filters.marz) params.set("marz", filters.marz);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/catalog/${categorySlug}?${qs}` : `/catalog/${categorySlug}`;
  }

  return (
    <>
      <SectionHeading
        breadcrumbs={
          <Breadcrumbs
            locale={lang}
            items={[
              { label: tCrumbs("home"), href: "/" },
              { label: tCrumbs("catalog"), href: "/catalog" },
              { label: category.namePlural },
            ]}
          />
        }
        title={category.namePlural}
        description={category.description}
      />

      <CategoryVendorList vendors={vendors} marz={filters.marz} />

      <Pagination page={filters.page} totalPages={totalPages} buildHref={pageHref} />
    </>
  );
}
