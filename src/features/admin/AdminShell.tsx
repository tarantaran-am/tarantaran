import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/features/admin/auth/actions";
import { Logo } from "@/features/admin/AdminLogo";
import { AdminNav } from "@/features/admin/AdminNav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-border bg-muted/40 px-6 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-r lg:border-b-0 lg:py-8">
        <Link href="/admin" className="flex flex-col gap-1">
          <Logo />
          <span className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">Админка</span>
        </Link>
        <AdminNav />
        <div className="flex flex-col gap-3 lg:mt-auto">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Открыть сайт ↗
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
