"use client";

import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function LeadActions({ phone }: { phone: string }) {
  const t = useTranslations("LeadActions");

  return (
    <div className="border border-border bg-background p-6">
      <div className="flex flex-col gap-3">
        <Button type="button" size="lg" className="w-full">
          {t("contact")}
        </Button>

        <div className="w-full border border-border px-5 py-3.5">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 text-sm font-medium text-foreground"
          >
            <Phone className="h-4 w-4" />
            {phone}
          </a>
          <p className="mt-2 text-center text-xs text-muted-foreground">{t("mentionUsHint")}</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
