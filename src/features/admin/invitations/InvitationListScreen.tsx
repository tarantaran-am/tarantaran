import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { prisma } from "@/shared/lib/db";
import { BlockInvitationButton } from "./BlockInvitationButton";

// Published and taken-down invitations, newest first; drafts are private and not listed.
export async function InvitationListScreen() {
  await requireAdmin();
  const invitations = await prisma.invitation.findMany({
    where: { OR: [{ isPublished: true }, { isBlocked: true }] },
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { account: { select: { email: true } }, _count: { select: { rsvps: true } } },
  });
  const date = new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeZone: "Asia/Yerevan" });

  return (
    <>
      <AdminPageHeader title="Приглашения" description={`Опубликованные и снятые: ${invitations.length}.`} />
      {invitations.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Опубликованных приглашений нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Пара</th>
                <th className="px-4 py-3 font-normal">Свадьба</th>
                <th className="px-4 py-3 font-normal">Аккаунт</th>
                <th className="px-4 py-3 font-normal">Ответов</th>
                <th className="px-4 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <a
                      href={`/i/${invitation.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {invitation.partnerOne} и {invitation.partnerTwo}
                    </a>
                    {invitation.isBlocked && <span className="ml-2 text-xs text-destructive">снято</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{date.format(invitation.startsAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{invitation.account.email}</td>
                  <td className="px-4 py-3 tabular-nums">{invitation._count.rsvps}</td>
                  <td className="px-4 py-3 text-right">
                    <BlockInvitationButton id={invitation.id} blocked={invitation.isBlocked} />
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
