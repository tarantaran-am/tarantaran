"use client";

import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { cn } from "cn";
import { setTheme } from "@/shared/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Header");

  function toggle() {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }

  // Both icons render and CSS picks one, so server and client markup match before the theme is known.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      title={t("toggleTheme")}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors outline-none hover:border-foreground/30 focus-visible:border-foreground/45 focus-visible:ring-2 focus-visible:ring-foreground/40",
        className,
      )}
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
