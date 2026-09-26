import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/shared/model/types";

// Where Supabase sends people back to, from Google and from sign-in emails. It only follows URLs
// from its Redirect URLs list, so an origin taken from the request cannot point anywhere else.
export function authCallbackUrl(origin: string, locale: Locale): string {
  const url = new URL("/api/auth/callback", origin);
  url.searchParams.set("locale", locale);
  return url.toString();
}

// 303 after a form post, so the browser follows up with a GET.
export function redirectToPage(request: NextRequest, locale: Locale, path: string, status?: 303) {
  return NextResponse.redirect(new URL(`/${locale}${path}`, request.nextUrl.origin), status);
}

// Server Actions check the Origin header themselves; these auth routes take plain form posts and
// have to, or another site could sign a visitor out, or into an account of its own choosing.
export function isSameOrigin(request: NextRequest): boolean {
  return request.headers.get("origin") === request.nextUrl.origin;
}
