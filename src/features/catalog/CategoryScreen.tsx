import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { Pagination } from "@/shared/components/Pagination";
import { CategoryVendorList } from "@/features/catalog/CategoryVendorList";
import { getVendorsByCategory } from "@/shared/lib/queries";
import { getCategory } from "@/shared/lib/categories";
import { getRequestLocale } from "@/i18n/locale";
import { stringParam, type SearchParams } from "@/shared/lib/listing-params";
import { withQuery } from "@/shared/lib/url";

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

  const marz = stringParam(searchParams.marz);
  const { vendors, page, totalPages } = await getVendorsByCategory(category.slug, lang, {
    marz,
    page: Number(searchParams.page),
  });

  const pageHref = (p: number) => withQuery(`/catalog/${category.slug}`, { marz, page: p > 1 ? p : undefined });

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

      <CategoryVendorList vendors={vendors} marz={marz} />

      <Pagination page={page} totalPages={totalPages} buildHref={pageHref} />
    </>
  );
}
