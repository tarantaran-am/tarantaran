"use client";

import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { MultiCombobox } from "@/shared/components/MultiCombobox";
import { MARZES } from "@/shared/config/marz";

type MarzComboboxProps = Omit<ComponentProps<typeof MultiCombobox>, "label" | "options" | "allLabel" | "countLabel">;

export function MarzCombobox(props: MarzComboboxProps) {
  const tMarz = useTranslations("Marz");
  const tFilters = useTranslations("Filters");

  return (
    <MultiCombobox
      label={tFilters("marzLabel")}
      options={MARZES.map((m) => ({ value: m, label: tMarz(m) }))}
      allLabel={tFilters("allMarzes")}
      countLabel={(count) => tFilters("selectedCount", { count })}
      {...props}
    />
  );
}
