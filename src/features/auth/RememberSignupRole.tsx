"use client";

import { useEffect } from "react";
import type { AccountRole } from "@/generated/prisma/enums";
import { SIGNUP_ROLE_COOKIE, SIGNUP_ROLE_MAX_AGE_SECONDS } from "@/shared/lib/auth-cookie";

export function rememberSignupRole(role: AccountRole): void {
  document.cookie = `${SIGNUP_ROLE_COOKIE}=${role}; path=/; max-age=${SIGNUP_ROLE_MAX_AGE_SECONDS}; samesite=lax`;
}

// Set from the login page itself rather than the link to it, so it also works when that link was
// opened in a new tab or shared.
export function RememberSignupRole({ role }: { role: AccountRole }) {
  useEffect(() => rememberSignupRole(role), [role]);
  return null;
}
