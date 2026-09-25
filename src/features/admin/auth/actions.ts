"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { verifyPassword } from "./password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "./session";

export type LoginState = { error?: "invalid" | "disabled" };

// A wrong password costs a second, which makes guessing it over the network impractical.
const FAILED_LOGIN_DELAY_MS = 1000;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const { ADMIN_PASSWORD_HASH: passwordHash, ADMIN_SESSION_SECRET: secret } = env;
  if (!passwordHash || !secret) return { error: "disabled" };

  const password = formData.get("password");
  if (typeof password !== "string" || !(await verifyPassword(password, passwordHash))) {
    await sleep(FAILED_LOGIN_DELAY_MS);
    return { error: "invalid" };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(secret), {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
