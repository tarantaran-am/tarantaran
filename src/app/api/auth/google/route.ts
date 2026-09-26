import { NextResponse, type NextRequest } from "next/server";
import { toLocale } from "@/i18n/routing";
import { authCallbackUrl, redirectToPage } from "@/features/auth/routes";
import { createSupabaseServerClient } from "@/features/auth/supabase";

// Starts "Continue with Google". A plain link points here rather than a form, so the CSP's
// form-action 'self' does not block the redirects to Supabase and Google.
export async function GET(request: NextRequest) {
  const locale = toLocale(request.nextUrl.searchParams.get("locale") ?? undefined);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl(request.nextUrl.origin, locale),
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) return redirectToPage(request, locale, "/login?error=google");

  return NextResponse.redirect(data.url);
}
