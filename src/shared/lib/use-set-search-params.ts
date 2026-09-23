"use client";

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { withQuery } from "@/shared/lib/url";

// Changing a filter always drops `page`: the old page number means nothing for a new result set.
export function useSetSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function setSearchParams(changes: Record<string, string | undefined>, { replace = false } = {}) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");

    const href = withQuery(pathname, params);
    if (replace) router.replace(href, { scroll: false });
    else router.push(href);
  };
}
