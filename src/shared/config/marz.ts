export const MARZES = [
  "yerevan",
  "kotayk",
  "ararat",
  "armavir",
  "aragatsotn",
  "gegharkunik",
  "lori",
  "shirak",
  "syunik",
  "tavush",
  "vayots_dzor",
] as const;

export type MarzSlug = (typeof MARZES)[number];

export function isMarz(value: unknown): value is MarzSlug {
  return typeof value === "string" && (MARZES as readonly string[]).includes(value);
}
