// A heart a guest pressed: kept in a cookie through signing in, which leaves the site for Google or an
// email and comes back, so the vendor is saved right after and they land back on the page they were on.
export const PENDING_FAVORITE_COOKIE = "tt_pending_favorite";
const MAX_AGE_SECONDS = 60 * 60;

export type PendingFavorite = { vendorId: string; returnTo: string };

export function rememberPendingFavorite(pending: PendingFavorite): void {
  const value = encodeURIComponent(JSON.stringify(pending));
  document.cookie = `${PENDING_FAVORITE_COOKIE}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// A path on this site without the locale, which is put in front of it. "//host" and "/\host" would
// lead browsers to another site.
const RETURN_PATH = /^\/(?![/\\])[^\\]*$/;

// Read on the server, so nothing in it is trusted. Without zod: this file also goes to the browser.
export function parsePendingFavorite(value: string | undefined): PendingFavorite | null {
  let data: Partial<Record<keyof PendingFavorite, unknown>> | null;
  try {
    data = value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
  const { vendorId, returnTo } = data ?? {};
  if (typeof vendorId !== "string" || !UUID.test(vendorId)) return null;
  const safe = typeof returnTo === "string" && returnTo.length <= 1000 && RETURN_PATH.test(returnTo);
  return { vendorId, returnTo: safe ? returnTo : "/account" };
}
