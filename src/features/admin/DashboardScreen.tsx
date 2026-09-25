import { requireAdmin } from "@/features/admin/auth/dal";
import Link from "next/link";
import { getDashboardStats } from "@/features/admin/queries";
import { getVendorStats } from "@/features/admin/stats/queries";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";

export async function DashboardScreen() {
  await requireAdmin();
  const [stats, vendorStats] = await Promise.all([getDashboardStats(), getVendorStats("30")]);
  const busiest = vendorStats.filter((row) => row.reveals + row.totalClicks + row.leads > 0).slice(0, 5);

  return (
    <>
      <AdminPageHeader title="Обзор" description="Главные цифры за последние 7 и 30 дней." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Подрядчики"
          value={stats.vendors.published}
          detail={`опубликовано из ${stats.vendors.total}`}
        />
        <StatCard label="Заявки" value={stats.leads.week} detail={`за 7 дней · ${stats.leads.month} за 30 дней`} />
        <StatCard
          label="Открытия контактов"
          value={stats.contactReveals.week}
          detail={`за 7 дней · ${stats.contactReveals.month} за 30 дней`}
        />
      </div>

      <section className="mt-10 max-w-3xl">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">Самые активные за 30 дней</h2>
          <Link href="/admin/stats" className="text-sm text-foreground hover:underline">
            Вся статистика →
          </Link>
        </div>
        {busiest.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока никакой активности.</p>
        ) : (
          <ol className="divide-y divide-border rounded-[20px] border border-border">
            {busiest.map((row) => (
              <li key={row.vendor.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <Link href={`/admin/vendors/${row.vendor.id}`} className="font-medium text-foreground hover:underline">
                  {row.vendor.nameRu}
                </Link>
                <span className="text-muted-foreground tabular-nums">
                  контакты {row.reveals} · переходы {row.totalClicks} · заявки {row.leads}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-[20px] border border-border p-6">
      <div className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{label}</div>
      <div className="mt-3 font-serif text-4xl text-foreground tabular-nums">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{detail}</div>
    </div>
  );
}
