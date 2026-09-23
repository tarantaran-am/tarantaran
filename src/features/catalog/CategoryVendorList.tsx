import { useTranslations } from "next-intl";
import { VendorCard } from "@/shared/components/VendorCard";
import { MarzFilter } from "@/features/catalog/MarzFilter";
import type { Vendor } from "@/shared/model/types";

export function CategoryVendorList({ vendors, marz }: { vendors: Vendor[]; marz: string }) {
  const t = useTranslations("CategoryVendorList");

  return (
    <div>
      <div className="mb-9 flex flex-wrap gap-3">
        <MarzFilter marz={marz} />
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
