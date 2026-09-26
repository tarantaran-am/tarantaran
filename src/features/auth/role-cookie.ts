import "server-only";
import { cookies } from "next/headers";
import type { AccountRole } from "@/generated/prisma/enums";
import { env } from "@/env";
import { ROLE_COOKIE } from "@/shared/lib/auth-cookie";

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
