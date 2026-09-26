import type { ReactNode } from "react";
import Image from "next/image";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { Check, LogOut } from "lucide-react";
import type { Account } from "@/generated/prisma/client";
import { WHATSAPP_URL } from "@/shared/config/site";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { initials } from "./initials";

export async function AccountScreen({ account }: { account: Account }) {
  const [t, format, locale] = await Promise.all([getTranslations("Auth"), getFormatter(), getLocale()]);
  const memberSince = format.dateTime(account.createdAt, { dateStyle: "long" });
  const displayName = account.name ?? account.email.split("@")[0];

  return (
    <div className="pt-16 md:pt-[68px]">
      <Container className="py-12 md:py-16">
        <header className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-center md:pb-12">
          <div
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-[1.618rem] text-primary-foreground md:size-24 md:text-[2.058rem]"
          >
            {initials(account.name, account.email)}
          </div>
          <div className="min-w-0">
            <Eyebrow className="mb-3">{t(`roles.${account.role}.cabinet`)}</Eyebrow>
            <h1 className="truncate font-serif text-[length:var(--text-page)] leading-[1.1] text-foreground">
              {displayName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("account.memberSince", { date: memberSince })}</p>
          </div>

          <form method="post" action="/api/auth/signout" className="sm:ml-auto sm:shrink-0">
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <LogOut />
              {t("account.signOut")}
            </Button>
          </form>
        </header>

        <div className="pt-10 md:pt-12">
          {account.role === "couple" ? <CoupleDashboard soon={t("soon")} /> : <VendorDashboard soon={t("soon")} />}
        </div>
      </Container>
    </div>
  );
}

async function CoupleDashboard({ soon }: { soon: string }) {
  const t = await getTranslations("Auth.couple");

  return (
    <Feature
      soon={soon}
      image="/backgrounds/inspiration-1.jpg"
      imageAlt={t("invite.imageAlt")}
      title={t("invite.title")}
      description={t("invite.description")}
      points={[t("invite.point1"), t("invite.point2"), t("invite.point3")]}
      footer={<p className="text-sm leading-relaxed text-muted-foreground">{t("invite.note")}</p>}
    />
  );
}

async function VendorDashboard({ soon }: { soon: string }) {
  const t = await getTranslations("Auth.vendor");

  return (
    <Feature
      soon={soon}
      image="/categories/photographers.jpg"
      imageAlt={t("profile.imageAlt")}
      title={t("profile.title")}
      description={t("profile.description")}
      points={[t("profile.point1"), t("profile.point2"), t("profile.point3")]}
      footer={
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg", className: "self-start" })}
        >
          {t("profile.cta")}
        </a>
      }
    />
  );
}

function Feature({
  soon,
  image,
  imageAlt,
  title,
  description,
  points,
  footer,
}: {
  soon: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  points: string[];
  footer: ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 overflow-hidden rounded-[28px] bg-muted md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="relative aspect-[var(--aspect-golden)] md:aspect-auto md:min-h-full">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <SoonBadge label={soon} />
        <div>
          <h2 className="font-serif text-[length:var(--text-section-sm)] leading-tight text-foreground">{title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <ul className="flex flex-col gap-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-foreground">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background">
                <Check className="size-3" strokeWidth={2.5} />
              </span>
              {point}
            </li>
          ))}
        </ul>
        {footer}
      </div>
    </section>
  );
}

function SoonBadge({ label }: { label: string }) {
  return (
    <span className="self-start rounded-full bg-background px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-primary uppercase">
      {label}
    </span>
  );
}
