"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/shared/components/ui/button";
import { BRAND } from "@/shared/config/site";
import { fontVariables } from "./fonts";
import { themeScript } from "@/shared/lib/theme";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full items-center justify-center bg-background font-sans text-foreground antialiased">
        <title>{`Error — ${BRAND}`}</title>
        <div className="max-w-sm px-6 py-24 text-center">
          <h1 className="mb-3 font-serif text-2xl text-foreground">Something went wrong</h1>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            Try reloading the page, or come back a little later.
          </p>
          <Button onClick={() => retry()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
