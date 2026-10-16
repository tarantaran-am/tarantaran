import "server-only";
import { cookies } from "next/headers";
import type { AccountRole } from "@/generated/prisma/enums";
import { env } from "@/env";
import { ROLE_COOKIE, SIGNUP_ROLE_COOKIE } from "@/shared/lib/auth-cookie";
import { parseRole } from "./params";

// As long as Supabase keeps its session cookies.
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

// Read by the header in the browser, so not httpOnly; it only decides which buttons show.
export async function rememberRole(role: AccountRole): Promise<void> {
  (await cookies()).set(ROLE_COOKIE, role, {
    path: "/",
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function forgetRole(): Promise<void> {
  (await cookies()).delete(ROLE_COOKIE);
}

// The role chosen before signing in (see SIGNUP_ROLE_COOKIE), read once.
export async function takeSignupRole(): Promise<AccountRole | null> {
  const store = await cookies();
  const role = parseRole(store.get(SIGNUP_ROLE_COOKIE)?.value);
  store.delete(SIGNUP_ROLE_COOKIE);
  return role;
}

// Read without using it up, to preselect the role on the signup page, which can't change cookies.
export async function peekSignupRole(): Promise<AccountRole | null> {
  return parseRole((await cookies()).get(SIGNUP_ROLE_COOKIE)?.value);
}
