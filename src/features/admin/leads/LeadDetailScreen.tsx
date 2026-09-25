import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { DeleteLeadButton } from "./DeleteLeadButton";
import { contactChannels, formatEventDate, formatReceivedAt, languageName, phoneDigits } from "./format";
import { getLead } from "./queries";

export async function LeadDetailScreen({ leadId }: { leadId: string }) {
  await requireAdmin();
  const lead = await getLead(leadId);
  if (!lead) notFound();

  const digits = phoneDigits(lead.phone);
  const linkClass = "text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground";

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Все заявки
      </Link>
      <AdminPageHeader title={lead.name} description={`Заявка от ${formatReceivedAt(lead.createdAt)}`} />

      <dl className="grid max-w-2xl grid-cols-1 gap-x-10 gap-y-6 rounded-[20px] border border-border p-6 sm:grid-cols-2 md:p-8">
        <Item label="Телефон">
          <a href={`tel:+${digits}`} className={linkClass}>
            {lead.phone}
          </a>
          <div className="mt-2 flex gap-4 text-sm">
            <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
              WhatsApp ↗
            </a>
            <a href={`https://t.me/+${digits}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Telegram ↗
            </a>
          </div>
        </Item>
        <Item label="Подрядчик">
          <Link href={`/admin/vendors/${lead.vendor.id}`} className={linkClass}>
            {lead.vendor.nameRu}
          </Link>
        </Item>
        <Item label="Дата мероприятия">{formatEventDate(lead.eventDate)}</Item>
        <Item label="Просит связаться">{contactChannels(lead)}</Item>
        <Item label="Язык сайта">{languageName(lead.locale)}</Item>
        <div className="sm:col-span-2">
          <Item label="Сообщение">
            {lead.message ? (
              <p className="whitespace-pre-line">{lead.message}</p>
            ) : (
              <span className="text-muted-foreground">Без сообщения</span>
            )}
          </Item>
        </div>
      </dl>

      <div className="mt-10 max-w-2xl border-t border-border pt-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Если клиент просит удалить свои данные, удалите заявку. Это действие нельзя отменить.
        </p>
        <DeleteLeadButton leadId={lead.id} />
      </div>
    </>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="mb-1.5 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}
