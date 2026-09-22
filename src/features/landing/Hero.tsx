"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { MARZES } from "@/shared/config/marz";
import type { Category } from "@/shared/model/types";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Button } from "@/shared/components/ui/button";
import { MultiCombobox } from "@/shared/components/MultiCombobox";

export function Hero({ categories }: { categories: Category[] }) {
  const t = useTranslations("Hero");
  const tMarz = useTranslations("Marz");
  const tFilters = useTranslations("Filters");
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMarzes, setSelectedMarzes] = useState<string[]>([]);

  function handleSearch() {
    const params = new URLSearchParams();
    if (selectedMarzes.length > 0) params.set("marz", selectedMarzes.join(","));

    if (selectedCategories.length === 1) {
      const qs = params.toString();
      router.push(`/catalog/${selectedCategories[0]}${qs ? `?${qs}` : ""}`);
      return;
    }
    if (selectedCategories.length > 1) {
      params.set("categories", selectedCategories.join(","));
    }
    const qs = params.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog");
  }

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-tone-sand lg:flex-row lg:items-center">
      <Image
        src="/backgrounds/bg.jpg"
        alt={t("imageAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />

      <div className="relative z-10 w-full px-6 pt-28 pb-16 md:px-12 lg:px-16 lg:py-32 xl:px-20">
        <div className="max-w-[640px] rounded-3xl bg-background/75 p-6 backdrop-blur-sm lg:rounded-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Eyebrow className="mb-8">{t("eyebrow")}</Eyebrow>

          <h1 className="mb-7 font-serif text-[length:var(--text-display)] leading-[1.07] text-foreground">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
            <br />
            <em>{t("titleLine3")}</em>
          </h1>

          <p className="mb-10 max-w-[460px] text-[15px] leading-relaxed text-muted-foreground">{t("subtitle")}</p>

          <div className="max-w-[560px]">
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background sm:flex-row sm:items-center">
              <MultiCombobox
                label={tFilters("categoryLabel")}
                options={categories.map((cat) => ({ value: cat.slug, label: cat.namePlural }))}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                allLabel={t("allCategories")}
                countLabel={(count) => t("selectedCount", { count })}
                icon={<Search className="h-4 w-4 shrink-0 text-muted-foreground" />}
                className="h-auto w-full min-w-0 flex-1 rounded-none border-0 px-5 py-4 hover:bg-muted/25 [&>svg:last-child]:hidden"
              />

              <div className="hidden w-px self-stretch bg-border sm:block" />
              <div className="h-px w-full bg-border sm:hidden" />

              <MultiCombobox
                label={tFilters("marzLabel")}
                options={MARZES.map((m) => ({ value: m, label: tMarz(m) }))}
                selected={selectedMarzes}
                onChange={setSelectedMarzes}
                allLabel={t("allMarzes")}
                countLabel={(count) => t("selectedCount", { count })}
                icon={<MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />}
                className="h-auto w-full min-w-0 flex-1 rounded-none border-0 px-5 py-4 hover:bg-muted/25 [&>svg:last-child]:hidden"
              />

              <Button onClick={handleSearch} size="lg" className="m-2 shrink-0 sm:my-0">
                {t("searchButton")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-xs text-muted-foreground">{t("trending")}</span>
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/catalog/${cat.slug}`}
                  className="text-xs text-foreground underline decoration-foreground/30 underline-offset-2 transition-all hover:decoration-foreground"
                >
                  {cat.namePlural}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
