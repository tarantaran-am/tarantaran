"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { RUBRICS } from "@/features/blog/rubrics";
import { SidebarNav } from "@/shared/components/SidebarNav";
import { withQuery } from "@/shared/lib/url";

export function RubricSidebar() {
  const params = useSearchParams();

  return <RubricNav active={params.get("rubric") ?? ""} query={params.get("q") ?? ""} />;
}

// Also the Suspense fallback: static pages read the search params only in the browser, and an empty
// sidebar slot would let the content jump into the sidebar's column until then.
export function RubricNav({ active = "", query = "" }: { active?: string; query?: string }) {
  const t = useTranslations("BlogIndexPage");

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
