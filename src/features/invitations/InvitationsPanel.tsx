import { getFormatter, getTranslations } from "next-intl/server";
import { ExternalLink, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/shared/components/ui/button";
import { prisma } from "@/shared/lib/db";
import { cn } from "cn";
import { MAX_DRAFTS, WEDDING_TIME_ZONE } from "./content";
import { DeleteInvitationButton } from "./DeleteInvitationButton";

// The couple's side of the account: their invitations, drafts and the live one.
export async function InvitationsPanel({ accountId }: { accountId: string }) {
  const [t, format] = await Promise.all([getTranslations("Invitations"), getFormatter()]);
  const invitations = await prisma.invitation.findMany({
    where: { accountId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { rsvps: true } } },
  });

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-[length:var(--text-section-sm)] leading-tight text-foreground">
          {t("panel.title")}
        </h2>
        {invitations.length < MAX_DRAFTS && (
          <Link href="/invitations/new" className={cn(buttonVariants(), "gap-1.5")}>
            <Plus />
            {t("panel.create")}
          </Link>
        )}
      </div>

      {invitations.length === 0 ? (
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{t("panel.empty")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {invitations.map((invitation) => {
            const status = invitation.isBlocked ? "blocked" : invitation.isPublished ? "published" : "draft";
            // In the site's language, like the rest of the cabinet, whatever language the invitation is in.
            const date = format.dateTime(invitation.startsAt, { dateStyle: "long", timeZone: WEDDING_TIME_ZONE });
            return (
              <li key={invitation.id} className="flex flex-col gap-4 rounded-[20px] border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-xl text-foreground">
                      {invitation.partnerOne} & {invitation.partnerTwo}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {date} · {invitation.venueName}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                      status === "published" && "bg-primary text-primary-foreground",
                      status === "draft" && "bg-muted text-muted-foreground",
                      status === "blocked" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    {t(`status.${status}`)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Link
                    href={`/invitations/${invitation.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    {t("panel.edit")}
                  </Link>
                  <Link
                    href={`/invitations/${invitation.id}/guests`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    {t("guests")} · {t("panel.replies", { count: invitation._count.rsvps })}
                  </Link>
                  {status === "published" && (
                    <a
                      href={`/i/${invitation.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                    >
                      {t("open")}
                      <ExternalLink />
                    </a>
                  )}
                  <div className="ml-auto">
                    <DeleteInvitationButton id={invitation.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
