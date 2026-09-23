"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { RUBRICS } from "@/features/blog/rubrics";
import { SidebarNav } from "@/shared/components/SidebarNav";
import { withQuery } from "@/shared/lib/url";

export function RubricSidebar() {
  const t = useTranslations("BlogIndexPage");
  const params = useSearchParams();
  const active = params.get("rubric") ?? "";
  const query = params.get("q") ?? "";

  const href = (rubric?: string) => withQuery("/blog", { rubric, q: query });

  return (
    <SidebarNav
      items={[
        { href: href(), label: t("allRubrics"), active: !active },
        ...RUBRICS.map((r) => ({ href: href(r), label: t(`rubrics.${r}`), active: active === r })),
      ]}
    />
  );
}
