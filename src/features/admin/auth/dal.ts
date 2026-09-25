import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { SESSION_COOKIE, isValidSessionToken } from "./session";

export const isAdminConfigured = () => Boolean(env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);

export const isAdmin = cache(async (): Promise<boolean> => {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return isValidSessionToken(token, env.ADMIN_SESSION_SECRET);
});

// Call at the top of every admin page, server action and data function: layouts are not
// re-rendered on navigation, so a check there alone would not protect anything.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
