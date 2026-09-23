import { Link } from "@/i18n/navigation";

export type SidebarNavItem = {
  href: string;
  label: string;
  active: boolean;
};

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  return (
    <nav className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-3 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`border px-3.5 py-2 text-sm whitespace-nowrap transition-colors lg:border-0 lg:border-l lg:px-3 lg:py-1.5 lg:whitespace-normal ${
            item.active
              ? "border-foreground bg-foreground/5 text-foreground lg:border-l-foreground lg:bg-transparent lg:font-medium"
              : "border-border text-muted-foreground hover:text-foreground lg:border-l-border hover:lg:border-l-foreground/40"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
