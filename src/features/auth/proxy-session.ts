import type { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  AuthInvalidJwtError,
  isAuthApiError,
  isAuthError,
  isAuthSessionMissingError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { isSessionCookieName } from "@/shared/lib/auth-cookie";
import { supabaseAuthConfig } from "./supabase";

type CookieToSet = { name: string; value: string; options: CookieOptions };
type ApplyAuthCookies = (response: NextResponse) => void;

// Supabase access tokens live for an hour and the refresh token is single-use, so an expired
// session has to be refreshed here: Server Components can read cookies but not write them.
// The new cookies go onto the request as well, so the page rendered for it already sees them.
export async function refreshAuthSession(request: NextRequest): Promise<ApplyAuthCookies | null> {
  // Visitors without a session skip the round trip entirely, including those who only have the
  // code-verifier cookies of a Google sign-in they never finished.
  if (!request.cookies.getAll().some((cookie) => isSessionCookieName(cookie.name))) return null;

  const { url, key } = supabaseAuthConfig();
  const cookiesToSet: CookieToSet[] = [];
  let headersToSet: Record<string, string> = {};

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies, headers) {
        cookiesToSet.push(...cookies);
        headersToSet = { ...headersToSet, ...headers };
      },
    },
  });

  // A session Supabase rejects (revoked, refresh token already used, unreadable) would otherwise stay
  // in the browser: pages treat the visitor as signed out while the header still shows them signed in.
  // Anything short of a clear rejection (network failure, rate limit, outage) keeps it for the next request.
  if (!(await hasValidSession(supabase))) {
    for (const { name } of request.cookies.getAll()) {
      if (isSessionCookieName(name) && !cookiesToSet.some((cookie) => cookie.name === name)) {
        cookiesToSet.push({ name, value: "", options: { path: "/", maxAge: 0 } });
      }
    }
  }

  if (cookiesToSet.length === 0) return null;

  for (const { name, value } of cookiesToSet) {
    if (value) request.cookies.set(name, value);
    else request.cookies.delete(name);
  }
  return (response) => {
    for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
    for (const [header, value] of Object.entries(headersToSet)) response.headers.set(header, value);
  };
}

// getClaims throws rather than returning an error for a token it cannot even decode.
async function hasValidSession({ auth }: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await auth.getClaims();
    return Boolean(data?.claims) || !isRejected(error);
  } catch (error) {
    return !isRejected(error);
  }
}

// Supabase said no to the session itself: the auth server refused it (a 4xx other than rate limiting),
// its signature is wrong, there is no session in the cookies, or the token does not even decode.
function isRejected(error: unknown): boolean {
  if (isAuthApiError(error)) return error.status < 500 && error.status !== 429;
  return error instanceof AuthInvalidJwtError || isAuthSessionMissingError(error) || !isAuthError(error);
}
