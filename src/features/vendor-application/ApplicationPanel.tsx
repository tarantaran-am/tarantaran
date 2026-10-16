import { getFormatter, getTranslations } from "next-intl/server";
import { CircleCheck, Clock, ExternalLink, MessageCircleWarning } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/shared/components/ui/button";
import { ChatLinks } from "@/shared/components/ChatLinks";
import { prisma } from "@/shared/lib/db";
import { cn } from "cn";
import { ApplicationForm } from "./ApplicationForm";
import { CARD_SELECT, applicationValues, cardValues } from "./card";
import { EMPTY_APPLICATION } from "./schema";

// The vendor's side of the account: the application for a card in the catalog and what the admin answered.
// Once there is a card the form starts from what the card has now, admin's edits included, and sends
// proposed changes; while they wait or after they were sent back, it shows the vendor's own proposal.
export async function ApplicationPanel({ accountId }: { accountId: string }) {
  const [t, format] = await Promise.all([getTranslations("VendorApplication"), getFormatter()]);
  const application = await prisma.vendorApplication.findUnique({
    where: { accountId },
    include: { vendor: { select: CARD_SELECT } },
  });

  const card = application?.vendor ?? null;
  const status = application?.status;
  // An approved application whose card the admin has since deleted starts over as a new one, without
  // the photos: their files went with the card.
  const startsOver = status === "approved" && !card;
  const values =
    card && status === "approved" ? cardValues(card) : application ? applicationValues(application) : EMPTY_APPLICATION;
  if (startsOver) values.photos = [];
  const notice = application && !startsOver ? application : null;
  const noticeKey = notice ? `${notice.status}${card && notice.status !== "approved" ? "Edit" : ""}` : null;
  const mode = !notice ? "new" : notice.status === "approved" ? "edit" : notice.status;

  return (
    <section className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <h2 className="font-serif text-[length:var(--text-section-sm)] leading-tight text-foreground">{t("title")}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {card ? t("cardDescription") : t("description")}
        </p>
      </div>

      <DoneForYou
        title={t(card ? "doneForYou.editTitle" : "doneForYou.title")}
        text={t(card ? "doneForYou.editText" : "doneForYou.text")}
      />

      {notice && noticeKey && (
        <Notice
          tone={notice.status}
          icon={
            notice.status === "approved" ? (
              <CircleCheck />
            ) : notice.status === "rejected" ? (
              <MessageCircleWarning />
            ) : (
              <Clock />
            )
          }
          title={t(`status.${noticeKey}.title`)}
          text={
            notice.status === "approved" && !card?.isPublished
              ? t("status.approved.preparing")
              : t(`status.${noticeKey}.text`, { date: format.dateTime(notice.updatedAt, { dateStyle: "long" }) })
          }
        >
          {notice.adminMessage && (
            <blockquote className="mt-4 rounded-2xl bg-background px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-foreground">
              <span className="mb-1 block text-xs text-muted-foreground">{t("adminMessage")}</span>
              {notice.adminMessage}
            </blockquote>
          )}
          {card?.isPublished && (
            <Link
              href={`/catalog/${card.category}/${card.slug}`}
              className={cn(buttonVariants({ size: "sm" }), "mt-4 gap-1.5 self-start")}
            >
              {t("openCard")}
              <ExternalLink />
            </Link>
          )}
        </Notice>
      )}

      <div className="max-w-3xl rounded-[28px] border border-border p-6 md:p-10">
        {mode === "edit" && <p className="mb-8 text-sm text-muted-foreground">{t("editHint")}</p>}
        <ApplicationForm initialValues={values} mode={mode} />
      </div>
    </section>
  );
}

function Notice({
  tone,
  icon,
  title,
  text,
  children,
}: {
  tone: "pending" | "approved" | "rejected";
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex max-w-3xl gap-4 rounded-[20px] p-5 md:p-6 [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
        tone === "rejected" ? "bg-destructive/10 [&>svg]:text-destructive" : "bg-muted [&>svg]:text-primary",
      )}
    >
      {icon}
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
        {children}
      </div>
    </div>
  );
}

// For vendors who would rather not fill in the form: they send the details in a chat and we make the card.
function DoneForYou({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex max-w-3xl flex-col gap-4 rounded-[20px] border border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
      <ChatLinks className="shrink-0" />
    </div>
  );
}
