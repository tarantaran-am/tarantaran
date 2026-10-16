"use client";

import { cn } from "cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export type FormSelectOption = { value: string; label: string };

// The shared Select for plain forms: it submits under `name` like a native select. An option with an
// empty value ("All categories", "None") is the cleared state and submits an empty string.
export function FormSelect({
  id,
  name,
  options,
  defaultValue = "",
  placeholder,
  required,
  invalid,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  name: string;
  options: readonly FormSelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const items = options.map(({ value, label }) => ({ value: value || null, label }));

  return (
    <Select id={id} name={name} items={items} defaultValue={defaultValue || null} required={required}>
      <SelectTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn("w-full min-w-40 text-base md:text-sm", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="p-1.5">
        {items.map(({ value, label }) => (
          <SelectItem key={value ?? ""} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
