import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/app/fonts";
import { SITE_URL, ogLocale } from "@/shared/config/seo";
import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { themeScript } from "@/shared/lib/theme";
import { cn } from "cn";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141110" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await localeParam();
  if (!hasLocale(routing.locales, locale)) return {};

  const [t, tBrand] = await Promise.all([getTranslations("Metadata"), getTranslations("Brand")]);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s — ${tBrand("name")}`,
    },
    description: t("description"),
    openGraph: {
      siteName: tBrand("name"),
      locale: ogLocale(locale),
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await localeParam();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={cn("h-full antialiased", fontVariables)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
