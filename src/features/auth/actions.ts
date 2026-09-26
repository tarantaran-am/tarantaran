"use server";

import { redirect } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { createAccount, getAuthUser } from "./dal";
import { parseRole } from "./params";
import { rememberRole } from "./role-cookie";

// The step after the first sign-in: the person picks couple or vendor, and that makes the account.
// The locale comes from a hidden field: next/root-params, and so getLocale, is not available in Server Actions.
export async function completeSignup(formData: FormData): Promise<void> {
  const locale = toLocale(formData.get("locale")?.toString());
  const user = await getAuthUser();
  if (!user) return redirect({ href: "/login", locale });

  const role = parseRole(formData.get("role")?.toString());
  if (!role) return redirect({ href: "/signup", locale });

  const account = await createAccount(user, role, locale);
  await rememberRole(account.role);
  redirect({ href: "/account", locale });
}
