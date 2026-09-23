import { useTranslations } from "next-intl";
import { SearchField } from "@/shared/components/SearchField";
import { MarzFilter } from "@/features/catalog/MarzFilter";

export function CatalogFilters({ marz, query }: { marz: string; query: string }) {
  const t = useTranslations("CatalogPage");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField query={query} placeholder={t("filters.searchPlaceholder")} className="min-w-[220px] flex-1" />
      <MarzFilter marz={marz} />
    </div>
  );
}
