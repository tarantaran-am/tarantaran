import { getTranslations } from "next-intl/server";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { VendorCard } from "@/shared/components/VendorCard";
import { Pagination } from "@/shared/components/Pagination";
import { CatalogFilters } from "@/features/catalog/CatalogFilters";
import { getCatalogVendors } from "@/shared/lib/queries";
import { getCategories } from "@/shared/lib/categories";
import { getRequestLocale } from "@/i18n/locale";
import { parseList } from "@/shared/lib/listing-params";

type SearchParams = Record<string, string | string[] | undefined>;

export async function CatalogScreen({ searchParams: params }: { searchParams: SearchParams }) {
  const lang = await getRequestLocale();
  const t = await getTranslations("CatalogPage");
  const tCrumbs = await getTranslations("Breadcrumbs");
  const marz = typeof params.marz === "string" ? params.marz : "";
  const categoriesParam = typeof params.categories === "string" ? params.categories : "";
  const query = typeof params.q === "string" ? params.q : "";
  const page = Number(params.page) || 1;

  const [allCategories, { vendors, total, totalPages }] = await Promise.all([
    getCategories(),
    getCatalogVendors(lang, { marz, categories: categoriesParam, query, page }),
  ]);

  const selectedCategorySlugs = parseList(categoriesParam);
  const selectedCategoryNames = allCategories
    .filter((c) => selectedCategorySlugs.includes(c.slug))
    .map((c) => c.namePlural);

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    if (marz) qs.set("marz", marz);
    if (categoriesParam) qs.set("categories", categoriesParam);
    if (query) qs.set("q", query);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/catalog?${s}` : "/catalog";
  }

  function hrefWithoutCategories() {
    const qs = new URLSearchParams();
    if (marz) qs.set("marz", marz);
    if (query) qs.set("q", query);
    const s = qs.toString();
    return s ? `/catalog?${s}` : "/catalog";
  }

  return (
    <>
      <SectionHeading
        breadcrumbs={
          <Breadcrumbs locale={lang} items={[{ label: tCrumbs("home"), href: "/" }, { label: tCrumbs("catalog") }]} />
        }
        title={t("title")}
        description={t("description")}
      />

      <CatalogFilters marz={marz} query={query} />

      {selectedCategoryNames.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("filters.categoriesLabel")}</span>
          <span className="text-xs text-foreground">{selectedCategoryNames.join(", ")}</span>
          <Link
            href={hrefWithoutCategories()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" />
            {t("filters.clearCategories")}
          </Link>
        </div>
      )}

      <p className="py-6 text-xs text-muted-foreground">{t("found", { count: total })}</p>

      {vendors.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={pageHref} />
    </>
  );
}
