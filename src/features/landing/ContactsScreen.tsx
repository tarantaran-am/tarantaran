import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { PageHeader } from "@/shared/components/PageHeader";
import { SocialIcon } from "@/shared/components/SocialIcon";
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS, WHATSAPP_URL } from "@/shared/config/site";

const TELEGRAM = SOCIAL_LINKS.find((social) => social.key === "telegram")!;
const FOLLOW_LINKS = SOCIAL_LINKS.filter((social) => social.key !== "telegram");

const TOPICS = [
  { key: "vendors", href: "/for-vendors" },
  { key: "advertising", href: "/for-vendors" },
] as const;

type Action = { href: string; label: string; external?: boolean };

export async function ContactsScreen() {
  const t = await getTranslations("ContactsPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <Container className="pb-24 md:pb-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-24">
          <div className="order-2 flex flex-col gap-12 lg:order-1">
            <dl className="flex flex-col gap-6">
              <Detail label={t("details.hoursLabel")}>{t("details.hours")}</Detail>
              <Detail label={t("details.locationLabel")}>{t("details.location")}</Detail>
              <Detail label={t("details.followLabel")}>
                <span className="flex flex-wrap gap-x-5 gap-y-2">
                  {FOLLOW_LINKS.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
                    >
                      <SocialIcon network={social.key} className="h-4 w-4 text-muted-foreground" />
                      {social.label}
                    </a>
                  ))}
                </span>
              </Detail>
            </dl>

            <div className="flex flex-col gap-8 rounded-[20px] bg-muted p-6 md:p-8">
              {TOPICS.map(({ key, href }) => (
                <div key={key}>
                  <h2 className="mb-2 text-[15px] font-medium text-foreground">{t(`topics.${key}.title`)}</h2>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{t(`topics.${key}.desc`)}</p>
                  <Link href={href} className="group inline-flex items-center gap-2 text-sm text-foreground">
                    <span>{t(`topics.${key}.link`)}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 border-b border-border lg:order-2">
            <Channel
              label={t("channels.whatsapp.title")}
              value={CONTACT_PHONE}
              hint={t("channels.whatsapp.hint")}
              actions={[
                { href: WHATSAPP_URL, label: t("channels.whatsapp.action"), external: true },
                { href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`, label: t("channels.whatsapp.call") },
              ]}
            />
            <Channel
              label={t("channels.telegram.title")}
              value={TELEGRAM.handle}
              hint={t("channels.telegram.hint")}
              actions={[{ href: TELEGRAM.href, label: t("channels.telegram.action"), external: true }]}
            />
            <Channel
              label={t("channels.email.title")}
              value={<BreakBefore text={CONTACT_EMAIL} at="@" />}
              hint={t("channels.email.hint")}
              actions={[{ href: `mailto:${CONTACT_EMAIL}`, label: t("channels.email.action") }]}
            />
          </div>
        </div>
      </Container>
    </>
  );
}

function Channel({
  label,
  value,
  hint,
  actions,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  actions: Action[];
}) {
  return (
    <div className="flex flex-col gap-5 border-t border-border py-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10 md:py-10">
      <div className="min-w-0">
        <Eyebrow className="mb-3">{label}</Eyebrow>
        <div className="font-serif text-xl leading-snug text-foreground md:text-2xl">{value}</div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:items-end">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-foreground"
          >
            <span className="underline decoration-foreground/25 underline-offset-4 transition-colors group-hover:decoration-foreground">
              {action.label}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="mb-1.5 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

// Lets a long value such as an email address wrap at a sensible point instead of mid-word.
function BreakBefore({ text, at }: { text: string; at: string }) {
  const index = text.indexOf(at);
  if (index <= 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <wbr />
      {text.slice(index)}
    </>
  );
}
