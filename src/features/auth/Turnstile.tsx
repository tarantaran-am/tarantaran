"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Cloudflare's check that the visitor is not a script. It runs unseen and shows its checkbox only
// when Cloudflare wants a click. Rendered explicitly rather than by class name, so it also appears
// after client-side navigation. It adds a "cf-turnstile-response" field to its form.
export function Turnstile({
  siteKey,
  locale,
  onVerifiedChange,
}: {
  siteKey: string;
  locale: string;
  onVerifiedChange: (verified: boolean) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Kept in a ref so a new callback from the parent does not re-create the widget.
  const onChange = useRef(onVerifiedChange);
  useEffect(() => {
    onChange.current = onVerifiedChange;
  });

  useEffect(() => {
    const { turnstile } = window;
    if (!ready || !container.current || !turnstile) return;
    const widgetId = turnstile.render(container.current, {
      sitekey: siteKey,
      // Turnstile has no Armenian; "auto" follows the browser instead of falling back to English.
      language: locale === "hy" ? "auto" : locale,
      theme: "light",
      size: "flexible",
      appearance: "interaction-only",
      callback: () => onChange.current(true),
      "expired-callback": () => onChange.current(false),
      "error-callback": () => onChange.current(false),
    });
    return () => turnstile.remove(widgetId);
  }, [ready, siteKey, locale]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      {/* Empty, and so takes no room, unless Cloudflare asks for a click. */}
      <div ref={container} className="empty:hidden" />
    </>
  );
}
