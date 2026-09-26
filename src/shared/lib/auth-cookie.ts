// Supabase keeps the session in "sb-<project>-auth-token", split into ".0", ".1"... when large.
// The "-code-verifier" cookies of an unfinished Google sign-in are not a session.
const SESSION_COOKIE_NAME = /^sb-.+-auth-token(?:\.\d+)?$/;

export function isSessionCookieName(name: string): boolean {
  return SESSION_COOKIE_NAME.test(name);
}
