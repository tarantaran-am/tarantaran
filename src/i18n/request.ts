import { locale as localeParam } from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const requested = locale ?? (await localeParam());

  const active = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale: active,
    messages: (await import(`../../messages/${active}.json`)).default,
  };
});
