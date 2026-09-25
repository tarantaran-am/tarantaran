import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/shared/components/ui/button";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { adminControlClass } from "@/features/admin/styles";
import { getVendorOptions, listVendors, type VendorListFilters, type VendorStatusFilter } from "./queries";

const STATUS_OPTIONS: { value: VendorStatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "published", label: "Опубликованные" },
  { value: "hidden", label: "Скрытые" },
];

export async function VendorListScreen({ filters }: { filters: VendorListFilters }) {
  await requireAdmin();
  const [vendors, options] = await Promise.all([listVendors(filters), getVendorOptions()]);
  const categoryLabel = new Map(options.categories.map(({ value, label }) => [value, label]));
  const filtered = Boolean(filters.query || filters.category || filters.status !== "all");

  return (
    <>
      <AdminPageHeader
        title="Подрядчики"
        description={`Всего: ${vendors.length}${filtered ? " по фильтру" : ""}.`}
        actions={
          <Link href="/admin/vendors/new" className={buttonVariants()}>
            Добавить подрядчика
          </Link>
        }
      />

      {/* A plain GET form: filters live in the URL, no client code needed. */}
      <form className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={filters.query}
          placeholder="Название или адрес страницы"
          className={cn(adminControlClass, "min-w-56 flex-1")}
        />
        <select name="category" defaultValue={filters.category} className={adminControlClass}>
          <option value="">Все категории</option>
          {options.categories.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={filters.status} className={adminControlClass}>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonVariants({ variant: "outline" })}>
          Показать
        </button>
        {filtered && (
          <Link href="/admin/vendors" className={buttonVariants({ variant: "ghost" })}>
            Сбросить
          </Link>
        )}
      </form>

      {vendors.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Никого не нашлось.</p>
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-border">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-normal">Подрядчик</th>
                <th className="px-5 py-3 font-normal">Категория</th>
                <th className="px-5 py-3 text-right font-normal">Фото</th>
                <th className="px-5 py-3 text-right font-normal">Заявки</th>
                <th className="px-5 py-3 font-normal">Статус</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/vendors/${vendor.id}`} className="font-medium text-foreground hover:underline">
                      {vendor.nameRu}
                    </Link>
                    <div className="text-xs text-muted-foreground">{vendor.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{categoryLabel.get(vendor.category)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{vendor._count.photos}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{vendor._count.leads}</td>
                  <td className="px-5 py-3">
                    <StatusBadge published={vendor.isPublished} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap",
        published ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground",
      )}
    >
      {published ? "На сайте" : "Скрыт"}
    </span>
  );
}
