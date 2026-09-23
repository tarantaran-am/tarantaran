"use client";

import { MarzCombobox } from "@/shared/components/MarzCombobox";
import { isMarz } from "@/shared/config/marz";
import { parseList } from "@/shared/lib/listing-params";
import { useSetSearchParams } from "@/shared/lib/use-set-search-params";

export function MarzFilter({ marz }: { marz: string }) {
  const setSearchParams = useSetSearchParams();

  return (
    <MarzCombobox
      selected={parseList(marz).filter(isMarz)}
      onChange={(values) => setSearchParams({ marz: values.join(",") })}
    />
  );
}
