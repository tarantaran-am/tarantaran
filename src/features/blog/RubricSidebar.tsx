"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { RUBRICS } from "@/features/blog/rubrics";

export function RubricSidebar() {
  const t = useTranslations("BlogIndexPage");
  const params = useSearchParams();
  const active = params.get("rubric") ?? "";
  const query = params.get("q") ?? "";

  function href(rubric?: string) {
    const qs = new URLSearchParams();
    if (rubric) qs.set("rubric", rubric);
    if (query) qs.set("q", query);
    const s = qs.toString();
    return s ? `/blog?${s}` : "/blog";
  }

  return (
    <nav className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
      <SidebarLink href={href()} active={!active}>
        {t("allRubrics")}
      </SidebarLink>
      {RUBRICS.map((r) => (
        <SidebarLink key={r} href={href(r)} active={active === r}>
          {t(`rubrics.${r}`)}
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
