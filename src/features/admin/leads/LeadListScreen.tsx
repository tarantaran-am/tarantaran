import Link from "next/link";
import type { Route } from "next";
import { buttonVariants } from "@/shared/components/ui/button";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { adminControlClass } from "@/features/admin/styles";
import { contactChannels, formatEventDate, formatReceivedAt } from "./format";
import { DEFAULT_PERIOD, PERIODS } from "@/features/admin/periods";
import { listLeads, listVendorChoices, type LeadListFilters } from "./queries";

export async function LeadListScreen({ filters }: { filters: LeadListFilters }) {
  await requireAdmin();
  const [{ leads, total, totalPages }, vendors] = await Promise.all([listLeads(filters), listVendorChoices()]);

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.vendorId) params.set("vendor", filters.vendorId);
    if (filters.period !== DEFAULT_PERIOD) params.set("period", filters.period);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return (query ? `/admin/leads?${query}` : "/admin/leads") as Route;
  };

  return (
    <>
      <AdminPageHeader title="Заявки" description={`Найдено: ${total}.`} />

      <form className="mb-6 flex flex-wrap gap-3">
        <select name="vendor" defaultValue={filters.vendorId} className={adminControlClass}>
          <option value="">Все подрядчики</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.nameRu}
            </option>
          ))}
        </select>
        <select name="period" defaultValue={filters.period} className={adminControlClass}>
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

      {leads.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Заявок за этот период нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-border">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-normal">Пришла</th>
                <th className="px-5 py-3 font-normal">Клиент</th>
                <th className="px-5 py-3 font-normal">Подрядчик</th>
                <th className="px-5 py-3 font-normal">Мероприятие</th>
                <th className="px-5 py-3 font-normal">Связь</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                    {formatReceivedAt(lead.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-foreground hover:underline">
                      {lead.name}
                    </Link>
                    <div className="text-xs whitespace-nowrap text-muted-foreground">{lead.phone}</div>
                  </td>
                  <td className="px-5 py-3">{lead.vendor.nameRu}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{formatEventDate(lead.eventDate)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{contactChannels(lead)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center gap-4 text-sm">
          {filters.page > 1 && (
            <Link href={pageHref(filters.page - 1)} className="text-foreground hover:underline">
              ← Новее
            </Link>
          )}
          <span className="text-muted-foreground">
            Страница {filters.page} из {totalPages}
          </span>
          {filters.page < totalPages && (
            <Link href={pageHref(filters.page + 1)} className="text-foreground hover:underline">
              Старше →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
