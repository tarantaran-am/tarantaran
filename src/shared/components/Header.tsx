"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Container } from "@/shared/components/container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "cn";
import { controlTrigger } from "@/shared/components/control-styles";
import { Logo } from "@/shared/components/Logo";

const LOCALE_LABELS: Record<string, string> = {
  hy: "Հայ",
  ru: "Рус",
  en: "Eng",
};

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t("nav.catalog"), href: "/catalog" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.forVendors"), href: "/for-vendors" },
  ];

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/96">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-[68px]">
          <Link href="/" className="shrink-0">
            <Logo className="text-[15px]" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <Select items={LOCALE_LABELS} value={locale} onValueChange={(next) => next && switchLocale(next)}>
              <SelectTrigger aria-label={t("language")} className={controlTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="p-1.5">
                {routing.locales.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/for-vendors" className={buttonVariants()}>
              {t("nav.listProfile")}
            </Link>
          </div>

          <button
            className="text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <div className="flex max-h-[calc(100vh-4rem)] flex-col gap-7 overflow-y-auto px-6 py-7">
            <div className="flex flex-col gap-4">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-base text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-border pt-5">
              <Select
                items={LOCALE_LABELS}
                value={locale}
                onValueChange={(l) => {
                  if (!l) return;
                  switchLocale(l);
                  setMobileOpen(false);
                }}
              >
                <SelectTrigger aria-label={t("language")} className={cn(controlTrigger, "w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="p-1.5">
                  {routing.locales.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LOCALE_LABELS[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-t border-border pt-5">
              <Link href="/for-vendors" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                {t("nav.listProfile")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
