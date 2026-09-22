import { hasLocale } from "next-intl";
import { defineRouting } from "next-intl/routing";
import type { Locale } from "@/shared/model/types";

export const routing = defineRouting({
  locales: ["hy", "ru", "en"],
  defaultLocale: "hy",

  localePrefix: "always",

  localeDetection: true,
});

export function toLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
