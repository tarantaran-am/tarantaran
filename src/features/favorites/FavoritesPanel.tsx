import { getTranslations } from "next-intl/server";
import { getRequestLocale } from "@/i18n/locale";
import { getFavoriteVendors } from "@/shared/lib/queries";
import { FavoritesGrid } from "./FavoritesGrid";

// The couple's side of the account: vendors they saved with the heart, removed with it too.
export async function FavoritesPanel({ accountId }: { accountId: string }) {
  const [t, locale] = await Promise.all([getTranslations("Favorites"), getRequestLocale()]);
  const vendors = await getFavoriteVendors(accountId, locale);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-serif text-[length:var(--text-section-sm)] leading-tight text-foreground">
        {t("panel.title")}
      </h2>
      <FavoritesGrid vendors={vendors} />
    </section>
  );
}
