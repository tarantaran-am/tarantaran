"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { SidebarNav } from "@/shared/components/SidebarNav";
import type { Category } from "@/shared/model/types";

export function CategorySidebar({ categories }: { categories: Category[] }) {
  const t = useTranslations("CatalogPage");
  const pathname = usePathname();

  const activeSlug = pathname.split("/")[2];

  return (
    <SidebarNav
      items={[
        { href: "/catalog", label: t("filters.allCategories"), active: !activeSlug },
        ...categories.map((c) => ({ href: `/catalog/${c.slug}`, label: c.namePlural, active: activeSlug === c.slug })),
      ]}
    />
  );
}
