"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { controlSurface, controlTrigger } from "@/shared/components/control-styles";
import { cn } from "cn";

const LOCALE_LABELS: Record<string, string> = {
  hy: "Հայ",
  ru: "Рус",
  en: "Eng",
};

// Plain links to this page in the other languages rather than a listbox: they work before the
// scripts load, crawlers follow them, and the header ships no popup library to every page.
function LocaleLink({
  locale,
  className,
  children,
  onClick,
}: {
  locale: string;
  className: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = useLocale() === locale;

  return (
    <Link
      href={pathname}
      locale={locale}
      replace
      hrefLang={locale}
      lang={locale}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
}

export function LocaleDropdown() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("language")}
        aria-expanded={open}
        aria-controls="locale-menu"
        onClick={() => setOpen(!open)}
        className={controlTrigger}
      >
        {LOCALE_LABELS[locale]}
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </button>
      {open && (
        <div
          id="locale-menu"
          className="absolute top-full right-0 z-50 mt-1 min-w-36 animate-in rounded-2xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          {routing.locales.map((l) => (
            <LocaleLink
              key={l}
              locale={l}
              onClick={() => setOpen(false)}
              className="relative flex w-full items-center rounded-2xl py-2 pr-8 pl-3 text-sm font-medium outline-hidden hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              {LOCALE_LABELS[l]}
              {l === locale && <CheckIcon className="pointer-events-none absolute right-2 size-4" aria-hidden="true" />}
            </LocaleLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function LocaleList({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("Header");
  const locale = useLocale();

  return (
    <nav aria-label={t("language")} className="flex gap-2">
      {routing.locales.map((l) => (
        <LocaleLink
          key={l}
          locale={l}
          onClick={onNavigate}
          className={cn(
            controlSurface,
            "flex h-9 flex-1 items-center justify-center rounded-3xl text-sm",
            l === locale ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LOCALE_LABELS[l]}
        </LocaleLink>
      ))}
    </nav>
  );
}
