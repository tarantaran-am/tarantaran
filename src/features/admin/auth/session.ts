import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// A session is just its expiry time signed with the server secret: "<expiresAt>.<signature>".
// There is one admin, so there is nothing else to store; changing the secret signs everyone out.
function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const expiresAt = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function isValidSessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expected = Buffer.from(sign(expiresAt, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  return Number(expiresAt) > now;
}
