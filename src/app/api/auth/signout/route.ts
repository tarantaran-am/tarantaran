import type { NextRequest } from "next/server";
import { toLocale } from "@/i18n/routing";
import { isSameOrigin, redirectToPage } from "@/features/auth/routes";
import { createSupabaseServerClient } from "@/features/auth/supabase";

// A route outside the proxy rather than a Server Action: on a page request the proxy may refresh
// the session and set fresh cookies on the same response that is meant to delete them.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const locale = toLocale(formData.get("locale")?.toString());

  if (isSameOrigin(request)) await (await createSupabaseServerClient()).auth.signOut();

  return redirectToPage(request, locale, "", 303);
}
