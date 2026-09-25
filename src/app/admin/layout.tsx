import type { Metadata } from "next";
import { cn } from "cn";
import { fontVariables } from "@/app/fonts";
import "../globals.css";

// The admin has its own root layout: no public header, footer or translations, and it stays out of search.
export const metadata: Metadata = {
  title: { default: "Админка", template: "%s — Админка Taran Taran" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ru" className={cn("h-full antialiased", fontVariables)}>
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
