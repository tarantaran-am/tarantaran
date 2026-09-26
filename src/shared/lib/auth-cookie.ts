// Supabase keeps the session in "sb-<project>-auth-token", split into ".0", ".1"... when large.
// The "-code-verifier" cookies of an unfinished Google sign-in are not a session.
const SESSION_COOKIE_NAME = /^sb-.+-auth-token(?:\.\d+)?$/;

export function isSessionCookieName(name: string): boolean {
  return SESSION_COOKIE_NAME.test(name);
}

// The kind of account signed in, set at sign-in for the header, which cannot ask the server: the layout
// is cached and shared by everyone. A hint for what to show, never a permission.
export const ROLE_COOKIE = "tt_role";

// "member": signed in, but the role is not known yet (the role step is still ahead, or signed in
// before this cookie existed).
export type AuthHint = "guest" | "member" | "couple" | "vendor";

export function authHint(cookieHeader: string): AuthHint {
  const cookies = cookieHeader.split(/;\s*/).map((cookie) => {
    const separator = cookie.indexOf("=");
    return separator === -1 ? [cookie, ""] : [cookie.slice(0, separator), cookie.slice(separator + 1)];
  });
  if (!cookies.some(([name]) => isSessionCookieName(name!))) return "guest";
  const role = cookies.find(([name]) => name === ROLE_COOKIE)?.[1];
  return role === "couple" || role === "vendor" ? role : "member";
}
