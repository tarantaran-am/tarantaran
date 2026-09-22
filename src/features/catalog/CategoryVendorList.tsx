"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { VendorCard } from "@/shared/components/VendorCard";
import { MultiCombobox } from "@/shared/components/MultiCombobox";
import type { Vendor } from "@/shared/model/types";
import { MARZES } from "@/shared/config/marz";

export function CategoryVendorList({ vendors, marz }: { vendors: Vendor[]; marz: string }) {
  const t = useTranslations("CategoryVendorList");
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
    <div>
      <div className="mb-9 flex flex-wrap gap-3">
        <MultiCombobox
          label={tFilters("marzLabel")}
          options={MARZES.map((m) => ({ value: m, label: tMarz(m) }))}
          selected={selected}
          onChange={updateMarz}
          allLabel={t("allMarzes")}
          countLabel={(count) => t("selectedCount", { count })}
        />
      </div>

      {vendors.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
