import { MARZES, type MarzSlug } from "@/shared/config/marz";

type Translator = (key: string, values?: Record<string, string | number>) => string;

export function marzLabel(marzes: MarzSlug[], t: Translator): string | undefined {
  if (marzes.length === 0) return undefined;
  if (marzes.length >= MARZES.length) return t("all");
  const [first, ...rest] = marzes;
  if (!first) return undefined;
  return rest.length === 0 ? t(first) : t("more", { first: t(first), count: rest.length });
}
