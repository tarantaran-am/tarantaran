"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuthHint } from "@/shared/lib/use-auth-hint";
import { cn } from "cn";
import { addFavorite, removeFavorite } from "./actions";
import { rememberPendingFavorite } from "./pending";
import { markFavorite, useFavoriteIds } from "./store";

// Couples save at once; guests sign in first and the vendor is saved on the way back.
// Vendors keep no favorites, so they get no heart.
export function FavoriteButton({ vendorId, className }: { vendorId: string; className?: string }) {
  const t = useTranslations("Favorites");
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuthHint();
  const ids = useFavoriteIds(auth === "couple");
  const saved = ids?.has(vendorId) ?? false;

  if (auth === "vendor") return null;

  function toggle() {
    if (auth !== "couple") {
      // Saved after signing in, then back to this page, filters and all.
      rememberPendingFavorite({ vendorId, returnTo: pathname + window.location.search });
      router.push("/login");
      return;
    }
    markFavorite(vendorId, !saved);
    (saved ? removeFavorite : addFavorite)(vendorId).catch(() => markFavorite(vendorId, saved));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Until the cookies are read it is not known whether this saves or leads to sign-in.
      disabled={auth === null || (auth === "couple" && ids === null)}
      aria-pressed={saved}
      aria-label={saved ? t("remove") : t("add")}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-background/96 text-foreground transition-colors outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/30",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", saved && "fill-primary text-primary")} strokeWidth={1.5} />
    </button>
  );
}
