"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const ITEMS: { href: Route; label: string }[] = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/vendors", label: "Подрядчики" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/stats", label: "Статистика" },
];

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: Route) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <nav className="-mx-3 flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-colors",
            isActive(item.href)
              ? "bg-background font-medium text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
