import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { refreshAuthSession } from "./features/auth/proxy-session";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const applyAuthCookies = await refreshAuthSession(request);
  const response = handleI18nRouting(request);
  applyAuthCookies?.(response);
  return response;
}

export const config = {
  // Invitations (/i/...) have no locale in their path: they speak the language the couple chose.
  matcher: "/((?!api|trpc|_next|_vercel|admin|i/|.*\\..*).*)",
};
