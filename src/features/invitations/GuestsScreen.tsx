import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeft, Download } from "lucide-react";
import type { Invitation, Rsvp } from "@/generated/prisma/client";
import { Link } from "@/i18n/navigation";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "cn";

export async function GuestsScreen({ invitation, rsvps }: { invitation: Invitation; rsvps: Rsvp[] }) {
  const [t, format] = await Promise.all([getTranslations("Invitations"), getFormatter()]);
  const coming = rsvps.filter((rsvp) => rsvp.attending);
  const people = coming.reduce((sum, rsvp) => sum + rsvp.guests, 0);

  return (
    <div className="pt-16 md:pt-[68px]">
      <Container className="py-10 md:py-14">
        <Link
          href={`/invitations/${invitation.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("guestsPage.back")}
        </Link>
        <Eyebrow className="mb-3">
          {invitation.partnerOne} & {invitation.partnerTwo}
        </Eyebrow>
        <h1 className="font-serif text-[length:var(--text-page)] leading-[1.1] text-foreground">
          {t("guestsPage.title")}
        </h1>

        <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-border p-5">
            <p className="text-xs text-muted-foreground">{t("guestsPage.coming")}</p>
            <p className="mt-1 font-serif text-[2rem] leading-none">{t("guestsPage.people", { count: people })}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("panel.replies", { count: coming.length })}</p>
          </div>
          <div className="rounded-[20px] border border-border p-5">
            <p className="text-xs text-muted-foreground">{t("guestsPage.declined")}</p>
            <p className="mt-1 font-serif text-[2rem] leading-none">{rsvps.length - coming.length}</p>
          </div>
        </div>

        {rsvps.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("guestsPage.empty")}</p>
        ) : (
          <>
            <a
              href={`/api/invitations/${invitation.id}/guests`}
              className={cn(buttonVariants({ variant: "outline" }), "mt-8 gap-1.5")}
            >
              <Download />
              {t("guestsPage.csv")}
            </a>
            <div className="mt-6 overflow-x-auto rounded-[20px] border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-normal">{t("guestsPage.name")}</th>
                    <th className="px-4 py-3 font-normal">{t("guestsPage.answer")}</th>
                    <th className="px-4 py-3 font-normal">{t("guestsPage.count")}</th>
                    <th className="px-4 py-3 font-normal">{t("guestsPage.comment")}</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">{rsvp.name}</td>
                      <td className={cn("px-4 py-3", rsvp.attending ? "text-foreground" : "text-muted-foreground")}>
                        {rsvp.attending ? t("guestsPage.yes") : t("guestsPage.no")}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{rsvp.attending ? rsvp.guests : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{rsvp.comment}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                        {format.dateTime(rsvp.createdAt, { dateStyle: "medium" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
