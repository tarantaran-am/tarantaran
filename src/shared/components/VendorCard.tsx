import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MapPin } from "lucide-react";
import { photoOrPlaceholder } from "@/shared/lib/photo";
import { marzLabel } from "@/shared/lib/marz-label";
import type { Vendor } from "@/shared/model/types";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const tMarz = useTranslations("Marz");
  const tCategory = useTranslations("Category");
  const region = marzLabel(vendor.marzes, tMarz);

  return (
    <Link
      href={`/catalog/${vendor.categorySlug}/${vendor.slug}`}
      className="group block overflow-hidden rounded-[20px] border border-border bg-background transition-colors duration-300 hover:border-foreground/25"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={photoOrPlaceholder(vendor.cover)}
          alt={vendor.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="rounded-full bg-background/96 px-3 py-1 text-[10px] tracking-wider text-foreground uppercase">
            {tCategory(`${vendor.categorySlug}.name`)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div>
          <h3 className="text-[15px] font-medium text-foreground">{vendor.name}</h3>
          {region && (
            <div className="mt-1 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{region}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
