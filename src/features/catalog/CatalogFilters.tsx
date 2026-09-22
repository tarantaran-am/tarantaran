"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { SearchField } from "@/shared/components/SearchField";
import { MultiCombobox } from "@/shared/components/MultiCombobox";
import { MARZES } from "@/shared/config/marz";

export function CatalogFilters({ marz, query }: { marz: string; query: string }) {
  const t = useTranslations("CatalogPage");
  const tMarz = useTranslations("Marz");
  const tFilters = useTranslations("Filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = marz.split(",").filter((value) => (MARZES as readonly string[]).includes(value));

  function updateMarz(values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) params.set("marz", values.join(","));
    else params.delete("marz");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField query={query} placeholder={t("filters.searchPlaceholder")} className="min-w-[220px] flex-1" />

      <MultiCombobox
        label={tFilters("marzLabel")}
        options={MARZES.map((m) => ({ value: m, label: tMarz(m) }))}
        selected={selected}
        onChange={updateMarz}
        allLabel={t("filters.allMarzes")}
        countLabel={(count) => t("filters.selectedCount", { count })}
      />
    </div>
  );
}
