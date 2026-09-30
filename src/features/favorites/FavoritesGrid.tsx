"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/shared/components/ui/button";
import { VendorCard } from "@/shared/components/VendorCard";
import type { Vendor } from "@/shared/model/types";
import { FavoriteButton } from "./FavoriteButton";
import { useFavoriteIds } from "./store";

// A vendor un-hearted here leaves the list at once, without reloading the page.
export function FavoritesGrid({ vendors }: { vendors: Vendor[] }) {
  const t = useTranslations("Favorites.panel");
  const ids = useFavoriteIds(true);
  const shown = ids ? vendors.filter((vendor) => ids.has(vendor.id)) : vendors;

  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{t("empty")}</p>
        <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>
          {t("browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} action={<FavoriteButton vendorId={vendor.id} />} />
      ))}
    </div>
  );
}
