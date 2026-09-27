import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { EyeOff, Link2, PencilLine, Users, type LucideIcon } from "lucide-react";

// What publishing gives the couple, next to the button, so they know before pressing it.
export function AfterPublish({ url }: { url: string }) {
  const t = useTranslations("Invitations.afterPublish");
  const points: { Icon: LucideIcon; text: ReactNode }[] = [
    {
      Icon: Link2,
      text: t.rich("link", { url: () => <span className="font-medium text-foreground">{url}</span> }),
    },
    { Icon: PencilLine, text: t("edit") },
    { Icon: Users, text: t("replies") },
    { Icon: EyeOff, text: t("private") },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-muted/40 p-5 md:p-6">
      <h2 className="text-[15px] font-medium text-foreground">{t("title")}</h2>
      <ul className="flex flex-col gap-3">
        {points.map(({ Icon, text }, index) => (
          <li key={index} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <Icon className="mt-0.5 size-4 shrink-0 text-foreground" strokeWidth={1.75} />
            <span className="break-words">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
