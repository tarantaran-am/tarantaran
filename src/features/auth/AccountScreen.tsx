import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { LogOut } from "lucide-react";
import type { Account } from "@/generated/prisma/client";
import { Container } from "@/shared/components/container";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Button } from "@/shared/components/ui/button";
import { InvitationsPanel } from "@/features/invitations/InvitationsPanel";
import { LocalDraftNotice } from "@/features/invitations/LocalDraftNotice";
import { FavoritesPanel } from "@/features/favorites/FavoritesPanel";
import { ApplicationPanel } from "@/features/vendor-application/ApplicationPanel";
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

        <div className="flex flex-col gap-10 pt-10 md:pt-12">
          {/* Signing in lands here for every role: a guest's invitation draft is picked up from here. */}
          <LocalDraftNotice />
          {account.role === "couple" ? (
            <>
              <InvitationsPanel accountId={account.id} />
              <FavoritesPanel accountId={account.id} />
            </>
          ) : (
            <ApplicationPanel accountId={account.id} />
          )}
        </div>
      </Container>
    </div>
  );
}
