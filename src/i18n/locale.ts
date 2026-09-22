import { locale as localeParam } from "next/root-params";
import type { Locale } from "@/shared/model/types";
import { toLocale } from "./routing";

export async function getRequestLocale(): Promise<Locale> {
  return toLocale(await localeParam());
}
