import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import type { Account, AccountRole } from "@/generated/prisma/client";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/shared/lib/db";
import { createSupabaseServerClient } from "./supabase";

export type AuthUser = { id: string; email: string; name: string | null };

export function toAuthUser(id: string, email: string | undefined, metadata: Record<string, unknown> | undefined) {
  if (!email) return null;
  const name = metadata?.full_name ?? metadata?.name;
  return { id, email, name: typeof name === "string" && name.trim() ? name.trim() : null } satisfies AuthUser;
}

// Who is signed in, with Google or an email link. getClaims verifies the token instead of trusting the cookie.
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return toAuthUser(claims.sub, claims.email, claims.user_metadata);
});

// A sign-in only becomes an account once the person has picked couple or vendor.
export const getAccount = cache(async (): Promise<Account | null> => {
  const user = await getAuthUser();
  if (!user) return null;
  return prisma.account.findUnique({ where: { id: user.id } });
});

// Call at the top of every account page and server action, like requireAdmin in the admin.
export async function requireAccount(): Promise<Account> {
  const account = await getAccount();
  if (account) return account;
  const href = (await getAuthUser()) ? "/signup" : "/login";
  return redirect({ href, locale: await getLocale() });
}

// Keeps the role chosen first if the account already exists, e.g. after a double submit.
export function createAccount(user: AuthUser, role: AccountRole, locale: string): Promise<Account> {
  return prisma.account.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email, name: user.name, role, locale },
    update: {},
  });
}

// Where a fresh sign-in lands: the account, or the role pick for someone who has none yet.
// The role is asked only after signing in, so one person can never end up with two of them.
export async function afterSignInPath(userId: string): Promise<"/account" | "/signup"> {
  const account = await prisma.account.findUnique({ where: { id: userId }, select: { id: true } });
  return account ? "/account" : "/signup";
}
