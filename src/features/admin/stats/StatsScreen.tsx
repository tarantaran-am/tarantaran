import Link from "next/link";
import { buttonVariants } from "@/shared/components/ui/button";
import { SITE_URL } from "@/shared/config/seo";
import { SOCIAL_LABELS, SOCIAL_NETWORKS } from "@/shared/config/social";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { PERIODS, describePeriod, type Period } from "@/features/admin/periods";
import { adminControlClass } from "@/features/admin/styles";
import { CopyReportButton } from "./CopyReportButton";
import { getVendorStats, type VendorStats } from "./queries";
import { buildVendorReport } from "./report";

function vendorPageUrl(vendor: VendorStats["vendor"]): string {
  return new URL(`/ru/catalog/${vendor.category}/${vendor.slug}`, SITE_URL).toString();
}

export async function StatsScreen({ period }: { period: Period }) {
  await requireAdmin();
  const rows = await getVendorStats(period);
  const periodText = describePeriod(period);

  return (
    <>
      <AdminPageHeader
        title="Статистика"
        description={`Сколько раз открывали контакты, переходили по ссылкам и отправляли заявки — ${periodText}.`}
      />

      <form className="mb-6 flex flex-wrap gap-3">
        <select name="period" defaultValue={period} className={adminControlClass}>
          {PERIODS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonVariants({ variant: "outline" })}>
          Показать
        </button>
      </form>

      <div className="overflow-x-auto rounded-[20px] border border-border">
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            <tr className="border-b border-border">
              <th className="px-5 py-3 font-normal">Подрядчик</th>
              <th className="px-5 py-3 text-right font-normal">Контакты</th>
              <th className="px-5 py-3 text-right font-normal">Переходы</th>
              <th className="px-5 py-3 text-right font-normal">Заявки</th>
              <th className="px-5 py-3 font-normal">
                <span className="sr-only">Отчёт</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.vendor.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/vendors/${row.vendor.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {row.vendor.nameRu}
                  </Link>
                  {!row.vendor.isPublished && <span className="ml-2 text-xs text-muted-foreground">скрыт</span>}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{row.reveals}</td>
                <td className="px-5 py-3 text-right">
                  <div className="tabular-nums">{row.totalClicks}</div>
                  {row.totalClicks > 0 && (
                    <div className="text-xs whitespace-nowrap text-muted-foreground">
                      {SOCIAL_NETWORKS.filter((network) => row.clicks[network] > 0)
                        .map(
                          (network) =>
                            `${network === "website" ? "Сайт" : SOCIAL_LABELS[network]} ${row.clicks[network]}`,
                        )
                        .join(" · ")}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{row.leads}</td>
                <td className="px-5 py-3 text-right">
                  <CopyReportButton report={buildVendorReport(row, periodText, vendorPageUrl(row.vendor))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Один посетитель считается один раз в день для каждого действия. Кнопка «Отчёт» копирует готовый текст для
        подрядчика.
      </p>
    </>
  );
}
