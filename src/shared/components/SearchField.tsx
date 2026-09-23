"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useDebouncedCallback } from "@/shared/lib/use-debounced-callback";
import { useSetSearchParams } from "@/shared/lib/use-set-search-params";
import { cn } from "cn";
import { controlSurface } from "@/shared/components/control-styles";

const DEBOUNCE_MS = 300;

export function SearchField({
  query,
  placeholder,
  className,
}: {
  query: string;
  placeholder: string;
  className?: string;
}) {
  const [value, setValue] = useState(query);
  const [appliedQuery, setAppliedQuery] = useState(query);
  const setSearchParams = useSetSearchParams();

  if (query !== appliedQuery) {
    setAppliedQuery(query);
    setValue(query);
  }

  const apply = useDebouncedCallback(
    (next: string) => setSearchParams({ q: next.trim() }, { replace: true }),
    DEBOUNCE_MS,
  );

  function handleChange(next: string) {
    setValue(next);
    apply(next);
  }

  return (
    <div className={cn("relative max-w-sm", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn("py-2.5 pr-4 pl-11", controlSurface)}
      />
    </div>
  );
}
