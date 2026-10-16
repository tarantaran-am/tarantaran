import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { getVendorOptions, type VendorOptions } from "@/features/admin/vendors/queries";
import { CARD_SELECT, applicationValues, cardValues } from "@/features/vendor-application/card";
import type { ApplicationValues } from "@/features/vendor-application/schema";
import { SOCIAL_LABELS, SOCIAL_NETWORKS, socialUrl } from "@/shared/config/social";
import { prisma } from "@/shared/lib/db";
import { latin } from "@/shared/lib/latin";
import { cn } from "cn";
import { ApproveForm, RejectForm } from "./ReviewForms";
import { STATUS_CLASSES, STATUS_LABELS } from "./status";

type Field = {
  label: string;
  // What is compared to tell whether the vendor changed the field.
  key: (values: ApplicationValues) => string;
  render: (values: ApplicationValues) => ReactNode;
};

function fields(options: VendorOptions): Field[] {
  const categoryLabel = (value: string) => options.categories.find((option) => option.value === value)?.label;
  return [
    { label: "Название", key: (v) => v.name, render: (v) => v.name },
    {
      label: "Категория",
      key: (v) => `${v.category}+${v.extraCategory}`,
      render: (v) => (
        <>
          {categoryLabel(v.category)}
          {v.extraCategory && <span className="text-muted-foreground"> + {categoryLabel(v.extraCategory)}</span>}
        </>
      ),
    },
    {
      label: "Фото",
      key: (v) => v.photos.join(),
      render: (v) => (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {v.photos.map((url, index) => (
            <li key={url} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Image src={url} alt={`Фото ${index + 1}`} fill sizes="160px" className="object-cover" />
              </a>
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-background/90 px-1.5 text-[10px]">
                  обложка
                </span>
              )}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Где работает",
      key: (v) => [...v.marzes].sort().join(),
      render: (v) =>
        v.marzes.length === options.marzes.length
          ? "Вся Армения"
          : options.marzes
              .filter(({ value }) => v.marzes.includes(value))
              .map(({ label }) => label)
              .join(", "),
    },
    {
      label: "Описание",
      key: (v) => v.description,
      render: (v) => <p className="leading-relaxed whitespace-pre-line">{v.description}</p>,
    },
    { label: "Телефон", key: (v) => v.phone, render: (v) => v.phone || "—" },
    {
      label: "Ссылки",
      key: (v) => SOCIAL_NETWORKS.map((network) => v[network]).join("|"),
      render: (v) => {
        const links = SOCIAL_NETWORKS.filter((network) => v[network]);
        if (links.length === 0) return "—";
        return (
          <ul className="flex flex-col gap-1">
            {links.map((network) => (
              <li key={network}>
                <span className="text-muted-foreground">{SOCIAL_LABELS[network]}: </span>
                <a
                  href={socialUrl(network, v[network])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  {v[network]}
                </a>
              </li>
            ))}
          </ul>
        );
      },
    },
  ];
}

export async function ApplicationReviewScreen({ id }: { id: string }) {
  await requireAdmin();
  const [application, options] = await Promise.all([
    prisma.vendorApplication.findUnique({
      where: { id },
      include: { account: { select: { email: true } }, vendor: { select: CARD_SELECT } },
    }),
    getVendorOptions(),
  ]);
  if (!application) notFound();

  const card = application.vendor;
  const proposed = applicationValues(application);
  // Proposed changes to a card are shown against what the card has now.
  const current = card && application.status !== "approved" ? cardValues(card) : null;
  const rows = fields(options).map((field) => ({
    ...field,
    changed: current !== null && field.key(current) !== field.key(proposed),
  }));
  const date = new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Yerevan" });

  return (
    <>
      <Link
        href="/admin/applications"
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Все анкеты
      </Link>
      <AdminPageHeader
        title={current ? `Изменения: ${card!.nameRu}` : application.name}
        description={`${application.account.email} · обновлена ${date.format(application.updatedAt)}`}
        actions={
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATUS_CLASSES[application.status])}>
            {STATUS_LABELS[application.status]}
          </span>
        }
      />

      <div className="grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex flex-col gap-6">
          {current && (
            <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              {rows.some((row) => row.changed)
                ? "Подрядчик предлагает изменения в карточке. Изменённые поля отмечены, ниже каждого — как сейчас на сайте."
                : "Подрядчик отправил анкету без изменений: она совпадает с карточкой."}
            </p>
          )}
          <dl className="flex flex-col gap-6">
            {rows.map((row) => (
              <div
                key={row.label}
                className={cn("flex flex-col gap-1.5", row.changed && "-mx-4 rounded-2xl bg-primary/5 px-4 py-3")}
              >
                <dt className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  {row.label}
                  {row.label === "Фото" && ` (${proposed.photos.length})`}
                  {row.changed && (
                    <span className="rounded-full bg-primary px-2 py-0.5 tracking-normal text-primary-foreground normal-case">
                      изменено
                    </span>
                  )}
                </dt>
                <dd className="text-sm text-foreground">{row.render(proposed)}</dd>
                {row.changed && current && (
                  <dd className="mt-1 border-l-2 border-border pl-3 text-sm text-muted-foreground">
                    <span className="mb-1 block text-xs">Сейчас на сайте:</span>
                    {row.render(current)}
                  </dd>
                )}
              </div>
            ))}
            {application.adminMessage && (
              <div className="flex flex-col gap-1.5">
                <dt className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">Ваш последний ответ</dt>
                <dd className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                  {application.adminMessage}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <aside className="flex flex-col gap-8">
          {card && (
            <Panel title="Карточка">
              <Link href={`/admin/vendors/${card.id}`} className="text-sm text-foreground underline underline-offset-4">
                {card.nameRu} →
              </Link>
              {current && rows.find((row) => row.label === "Категория")?.changed && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Если сменится основная категория, изменится и ссылка на страницу подрядчика.
                </p>
              )}
            </Panel>
          )}
          {application.status === "approved" ? (
            !card && (
              <Panel title="Карточка">
                <p className="text-sm text-muted-foreground">Карточка, созданная из анкеты, удалена.</p>
              </Panel>
            )
          ) : (
            <>
              <Panel title={current ? "Применить изменения" : "Одобрить"}>
                <ApproveForm id={application.id} suggestedSlug={current ? null : latin(application.name, 60)} />
              </Panel>
              <Panel title="Вернуть на доработку">
                <RejectForm
                  id={application.id}
                  defaultMessage={application.status === "rejected" ? (application.adminMessage ?? "") : ""}
                />
              </Panel>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border p-5">
      <h2 className="mb-4 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}
