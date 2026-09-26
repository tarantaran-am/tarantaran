"use client";

import { useSyncExternalStore } from "react";
import { isSessionCookieName } from "./auth-cookie";

function subscribe(onChange: () => void) {
  // Chromium and Safari report cookie changes; elsewhere the snapshot is re-read on every render,
  // which the header gets on each navigation.
  const store = (globalThis as { cookieStore?: EventTarget }).cookieStore;
  store?.addEventListener("change", onChange);
  return () => store?.removeEventListener("change", onChange);
}

const hasSessionCookie = () => document.cookie.split("; ").some((cookie) => isSessionCookieName(cookie.split("=")[0]!));

// Whether a Supabase session cookie is present. The layout is cached and shared by everyone, so the
// header can only learn this in the browser. It is a hint for what to link to, not a check:
// the account page verifies the session, and the proxy deletes session cookies Supabase rejects.
export function useSignedIn(): boolean {
  return useSyncExternalStore(subscribe, hasSessionCookie, () => false);
}
