"use client";

import type { ReactNode } from "react";
import { cn } from "cn";
import { controlTrigger } from "@/shared/components/control-styles";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/shared/components/ui/combobox";

const ALL = "__all__";

export function MultiCombobox({
  label,
  options,
  selected,
  onChange,
  allLabel,
  countLabel,
  icon,
  className,
  contentClassName,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  allLabel: string;
  countLabel: (count: number) => string;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const labels = new Map([[ALL, allLabel], ...options.map((o) => [o.value, o.label] as const)]);
  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? (labels.get(selected[0] ?? "") ?? allLabel)
        : countLabel(selected.length);

  return (
    <Combobox
      multiple
      items={[ALL, ...options.map((option) => option.value)]}
      value={selected.length === 0 ? [ALL] : selected}
      onValueChange={(value: string[]) =>
        onChange(selected.length > 0 && value.includes(ALL) ? [] : value.filter((item) => item !== ALL))
      }
      itemToStringLabel={(value: string) => labels.get(value) ?? value}
    >
      <ComboboxTrigger aria-label={label} className={cn(controlTrigger, className)}>
        {icon}
        <span className="min-w-0 flex-1 truncate text-left">{summary}</span>
      </ComboboxTrigger>
      <ComboboxContent className={cn("data-[chips=true]:min-w-64", contentClassName)}>
        <ComboboxList>
          {(value: string) => (
            <ComboboxItem key={value} value={value}>
              {labels.get(value)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
