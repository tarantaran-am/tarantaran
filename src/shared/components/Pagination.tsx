import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/locale";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

const disabledClass = "pointer-events-none opacity-35";

export async function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const [t, locale] = await Promise.all([getTranslations("Pagination"), getRequestLocale()]);
  const href = (target: number) => getPathname({ href: buildHref(target), locale });
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <PaginationRoot className="mt-14" aria-label={t("label")}>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            href={isFirst ? undefined : href(page - 1)}
            text={t("prev")}
            aria-label={t("prev")}
            aria-disabled={isFirst}
            className={isFirst ? disabledClass : undefined}
          />
        </PaginationItem>
        <PaginationItem className="px-2 text-sm text-muted-foreground">
          {t("status", { page, totalPages })}
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={isLast ? undefined : href(page + 1)}
            text={t("next")}
            aria-label={t("next")}
            aria-disabled={isLast}
            className={isLast ? disabledClass : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
