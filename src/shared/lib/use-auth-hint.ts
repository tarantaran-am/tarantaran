"use client";

import { useSyncExternalStore } from "react";
import { authHint, type AuthHint } from "./auth-cookie";

function subscribe(onChange: () => void) {
  // Chromium and Safari report cookie changes; elsewhere the snapshot is re-read on every render,
  // which the header gets on each navigation.
  const store = (globalThis as { cookieStore?: EventTarget }).cookieStore;
  store?.addEventListener("change", onChange);
  return () => store?.removeEventListener("change", onChange);
}

// Who is signed in, as far as the cookies tell, or null until the browser can read them: the layout
// is cached and shared by everyone, so the server never knows. A hint for what to show, not a check:
// pages verify the session, and the proxy deletes session cookies Supabase rejects.
export function useAuthHint(): AuthHint | null {
  return useSyncExternalStore(
    subscribe,
    () => authHint(document.cookie),
    () => null,
  );
}
