"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SocialIcon } from "@/shared/components/SocialIcon";
import { SOCIAL_LABELS, type ContactEventKind, type SocialNetwork } from "@/shared/config/social";

export function VendorContacts({
  vendorId,
  phone,
  address,
  links,
}: {
  vendorId: string;
  phone: string;
  address: string;
  links: { network: SocialNetwork; href: string }[];
}) {
  const t = useTranslations("LeadActions");
  const tVendor = useTranslations("VendorPage");
  const locale = useLocale();
  const [revealed, setRevealed] = useState(false);

  function report(kind: ContactEventKind) {
    const body = JSON.stringify({ vendorId, kind, locale });
    const sent = navigator.sendBeacon?.("/api/vendor-contacts", new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch("/api/vendor-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }

  function reveal() {
    setRevealed(true);
    report("reveal");
  }

  const visibleLinks = revealed ? links : [];

  return (
    <>
      <div className="border border-border bg-background p-6">
        {revealed ? (
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
        ) : (
          <Button type="button" size="lg" className="w-full" onClick={reveal}>
            {t("showContacts")}
          </Button>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
      </div>

      {(visibleLinks.length > 0 || address) && (
        <div className="border border-border bg-background p-6">
          <div className="mb-4 text-[10px] tracking-wider text-muted-foreground uppercase">{tVendor("links")}</div>
          <div className="flex flex-col gap-3">
            {address && (
              <div className="flex items-start gap-2.5 text-sm text-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{address}</span>
              </div>
            )}
            {visibleLinks.map(({ network, href }) => (
              <a
                key={network}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-foreground transition-opacity hover:opacity-70"
                onClick={() => report(network)}
                onAuxClick={(event) => {
                  if (event.button === 1) report(network);
                }}
              >
                <SocialIcon network={network} className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="underline decoration-foreground/25 underline-offset-4">
                  {network === "website" ? tVendor("website") : SOCIAL_LABELS[network]}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
