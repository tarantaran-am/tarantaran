import Link from "next/link";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { getVendorOptions } from "@/features/admin/vendors/queries";
import { prisma } from "@/shared/lib/db";
import { cn } from "cn";
import { STATUS_CLASSES, STATUS_LABELS } from "./status";

// Vendors' requests for a card: the ones waiting for an answer first, then the rest, newest first.
export async function ApplicationListScreen() {
  await requireAdmin();
  const [applications, options] = await Promise.all([
    prisma.vendorApplication.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: { account: { select: { email: true } } },
    }),
    getVendorOptions(),
  ]);
  const pending = applications.filter((application) => application.status === "pending");
  const sorted = [...pending, ...applications.filter((application) => application.status !== "pending")];
  const categoryLabel = new Map(options.categories.map(({ value, label }) => [value, label]));
  const date = new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeZone: "Asia/Yerevan" });

  return (
    <>
      <AdminPageHeader
        title="Анкеты подрядчиков"
        description={`Ждут ответа: ${pending.length}. Подрядчик видит ответ в своём кабинете.`}
      />
      {sorted.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Анкет пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Название</th>
                <th className="px-4 py-3 font-normal">Категория</th>
                <th className="px-4 py-3 font-normal">Аккаунт</th>
                <th className="px-4 py-3 font-normal">Обновлена</th>
                <th className="px-4 py-3 font-normal">Статус</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((application) => (
                <tr key={application.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {application.name}
                    </Link>
                    {application.vendorId && application.status !== "approved" && (
                      <span className="ml-2 text-xs text-muted-foreground">изменения карточки</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel.get(application.category)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{application.account.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{date.format(application.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
                        STATUS_CLASSES[application.status],
                      )}
                    >
                      {STATUS_LABELS[application.status]}
                    </span>
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
