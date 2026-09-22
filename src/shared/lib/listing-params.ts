export const MAX_PAGE = 10_000;
const MAX_QUERY = 100;

export function normalizePage(page: number | undefined): number {
  if (!Number.isFinite(page) || (page as number) < 1) return 1;
  return Math.min(Math.floor(page as number), MAX_PAGE);
}

export function normalizeQuery(query: string | undefined): string | undefined {
  return query?.trim().slice(0, MAX_QUERY) || undefined;
}

export const MAX_LIST_VALUES = 20;

export function parseList(value: string | undefined): string[] {
  if (!value) return [];
  const items = value
    .split(",", MAX_LIST_VALUES)
    .map((v) => v.trim())
    .filter(Boolean);
  return [...new Set(items)];
}
