import type { NextRequest } from "next/server";
import { toLocale } from "@/i18n/routing";
import { afterSignInPath, toAuthUser } from "@/features/auth/dal";
import { redirectToPage } from "@/features/auth/routes";
import { createSupabaseServerClient } from "@/features/auth/supabase";

// Supabase sends people back here: from Google with a one-time code, or from a sign-in email with a token.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = toLocale(searchParams.get("locale") ?? undefined);
  const to = (path: string) => redirectToPage(request, locale, path);

  // Mail scanners open links in emails on their own and would use up the single-use token,
  // so the email link only leads to a page where the person confirms with a click.
  const tokenHash = searchParams.get("token_hash");
  if (tokenHash) return to(`/login/confirm?${new URLSearchParams({ token_hash: tokenHash })}`);

  // Without a code this was not a Google sign-in, or Google sent an error: an email link that did
  // not carry a token, most likely because its Supabase template still uses the default URL.
  const code = searchParams.get("code");
  if (!code) return to(searchParams.has("error") ? "/login?error=google" : "/login?error=link");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const user = data.user && toAuthUser(data.user.id, data.user.email, data.user.user_metadata);
  if (error || !user) return to("/login?error=google");

  return to(await afterSignInPath(user.id));
}
