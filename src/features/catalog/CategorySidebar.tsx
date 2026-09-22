"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Category } from "@/shared/model/types";

export function CategorySidebar({ categories }: { categories: Category[] }) {
  const t = useTranslations("CatalogPage");
  const pathname = usePathname();

  const activeSlug = pathname.split("/")[2];

  return (
    <nav className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
      <SidebarLink href="/catalog" active={!activeSlug}>
        {t("filters.allCategories")}
      </SidebarLink>
      {categories.map((c) => (
        <SidebarLink key={c.slug} href={`/catalog/${c.slug}`} active={activeSlug === c.slug}>
          {c.namePlural}
        </SidebarLink>
      ))}
    </nav>
  );
}

function SidebarLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border px-3.5 py-2 text-sm whitespace-nowrap transition-colors lg:border-0 lg:border-l lg:px-3 lg:py-1.5 lg:whitespace-normal ${
        active
          ? "border-foreground bg-foreground/5 text-foreground lg:border-l-foreground lg:bg-transparent lg:font-medium"
          : "border-border text-muted-foreground hover:text-foreground lg:border-l-border hover:lg:border-l-foreground/40"
      }`}
    >
      {children}
    </Link>
  );
}
