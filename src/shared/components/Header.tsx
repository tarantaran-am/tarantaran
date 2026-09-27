"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/shared/components/container";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "cn";
import { LocaleDropdown, LocaleList } from "@/shared/components/LocaleSwitcher";
import { Logo } from "@/shared/components/Logo";
import { ButtonSkeleton } from "@/shared/components/ButtonSkeleton";
import { useAuthHint } from "@/shared/lib/use-auth-hint";
import { useMinimumDelay } from "@/shared/lib/use-minimum-delay";

export function Header() {
  const t = useTranslations("Header");

  const [mobileOpen, setMobileOpen] = useState(false);
  // null until the browser has read the cookies: the header is cached and shared, the server never knows.
  const authHint = useAuthHint();
  // The skeletons stay for at least 200ms after the page starts loading: a shorter flash reads as a glitch.
  const auth = useMinimumDelay(450) ? authHint : null;
  const authLink =
    auth === "guest"
      ? { href: "/login" as const, label: t("nav.login") }
      : { href: "/account" as const, label: t("nav.account") };
  // For vendors and guests: a signed-in bride or groom has no profile to list.
  const showListProfile = auth !== "couple";

  const navLinks = [
    { label: t("nav.catalog"), href: "/catalog" },
    { label: t("nav.invitations"), href: "/invitations/new" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.forVendors"), href: "/for-vendors" },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/96">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-[68px]">
          <Link href="/" className="shrink-0">
            <Logo className="text-[15px]" />
          </Link>

          {/* The full bar needs about 1100px with the Armenian labels; narrower screens get the menu button. */}
          <nav className="hidden items-center gap-7 xl:flex 2xl:gap-9">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 xl:flex">
            <LocaleDropdown />
            <div className="flex items-center gap-3">
              {auth === null ? (
                <>
                  <ButtonSkeleton>{t("nav.listProfile")}</ButtonSkeleton>
                  <ButtonSkeleton className="min-w-24">{authLink.label}</ButtonSkeleton>
                </>
              ) : (
                <>
                  {showListProfile && (
                    <Link href="/for-vendors" className={buttonVariants()}>
                      {t("nav.listProfile")}
                    </Link>
                  )}
                  <Link href={authLink.href} className={cn(buttonVariants({ variant: "outline" }), "min-w-24")}>
                    {authLink.label}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 xl:hidden">
            {auth === null ? (
              <ButtonSkeleton size="sm" className="min-w-20">
                {authLink.label}
              </ButtonSkeleton>
            ) : (
              <Link
                href={authLink.href}
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-w-20")}
              >
                {authLink.label}
              </Link>
            )}
            <button
              className="text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("openMenu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background xl:hidden">
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
              <LocaleList onNavigate={() => setMobileOpen(false)} />
            </div>
            {showListProfile && (
              <div className="border-t border-border pt-5">
                <Link href="/for-vendors" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                  {t("nav.listProfile")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
