import type { NextRequest } from "next/server";
import { toLocale } from "@/i18n/routing";
import { afterSignInPath } from "@/features/auth/dal";
import { isSameOrigin, redirectToPage } from "@/features/auth/routes";
import { createSupabaseServerClient } from "@/features/auth/supabase";

// The "Sign in" button on the page a sign-in email links to. A route outside the proxy rather than
// a Server Action, so a stale session the proxy deletes cannot clash with the new one set here.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const locale = toLocale(formData.get("locale")?.toString());
  const tokenHash = formData.get("token_hash")?.toString();
  const to = (path: string) => redirectToPage(request, locale, path, 303);

  if (!isSameOrigin(request) || !tokenHash) return to("/login?error=link");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
  if (error || !data.user) return to("/login?error=link");

  return to(await afterSignInPath(data.user.id));
}
