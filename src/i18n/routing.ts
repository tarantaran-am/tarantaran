import { hasLocale } from "next-intl";
import { defineRouting } from "next-intl/routing";
import type { Locale } from "@/shared/model/types";

export const routing = defineRouting({
  locales: ["hy", "ru", "en"],
  defaultLocale: "hy",

  localePrefix: "always",

  localeDetection: true,
});

// `value` is undefined outside the [locale] routes, e.g. in the admin, which has its own root layout.
export function toLocale(value: string | undefined): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
