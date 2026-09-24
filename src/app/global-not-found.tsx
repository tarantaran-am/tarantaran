import type { Metadata } from "next";
import Link from "next/link";
import { routing } from "@/i18n/routing";
import { BRAND } from "@/shared/config/site";
import { buttonVariants } from "@/shared/components/ui/button";
import { Eyebrow } from "@/shared/components/eyebrow";
import { fontVariables } from "./fonts";
import { themeScript } from "@/shared/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: `404 — ${BRAND}`,
  description: "Page not found.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full items-center justify-center bg-background font-sans text-foreground antialiased">
        <div className="max-w-sm px-6 py-24 text-center">
          <Eyebrow className="mb-4">404</Eyebrow>
          <h1 className="mb-3 font-serif text-2xl text-foreground">Page not found</h1>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            The link is out of date, or the address has a typo in it.
          </p>
          <Link href={`/${routing.defaultLocale}`} className={buttonVariants({ size: "sm" })}>
            Go to homepage
          </Link>
        </div>
      </body>
    </html>
  );
}
