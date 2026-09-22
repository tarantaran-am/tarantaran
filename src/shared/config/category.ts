export const CATEGORIES = [
  "venues",
  "photographers",
  "videographers",
  "decor",
  "reels",
  "stylists",
  "dresses",
  "cakes",
  "cars",
  "hosts",
  "show",
  "choreographers",
  "catering",
  "dj",
] as const;

export type CategorySlug = (typeof CATEGORIES)[number];

export function isCategory(value: unknown): value is CategorySlug {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}
