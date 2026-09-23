"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Modal, ModalHeader } from "@/shared/components/Modal";
import { SocialIcon } from "@/shared/components/SocialIcon";
import { LeadDialog } from "@/features/vendor/LeadDialog";
import { SOCIAL_LABELS, type ContactEventKind, type SocialNetwork } from "@/shared/config/social";

export function VendorContacts({
  vendorId,
  vendorName,
  phone,
  address,
  links,
}: {
  vendorId: string;
  vendorName: string;
  phone: string;
  address: string;
  links: { network: SocialNetwork; href: string }[];
}) {
  const t = useTranslations("LeadActions");
  const tVendor = useTranslations("VendorPage");
  const locale = useLocale();

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

  return (
    <>
      <div className="border border-border bg-background p-6">
        <Modal
          closeLabel={t("close")}
          onOpenChange={(open) => {
            if (open) report("reveal");
          }}
          trigger={
            <Button size="lg" className="w-full">
              {t("showContacts")}
            </Button>
          }
        >
          <ModalHeader title={t("contactsTitle")} description={vendorName} />

          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="mt-6 flex items-center justify-center gap-2 border border-border px-5 py-3.5 text-sm font-medium text-foreground"
          >
            <Phone className="h-4 w-4" />
            {phone}
          </a>

          {links.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              {links.map(({ network, href }) => (
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
          )}
        </Modal>

        <div className="mt-3">
          <LeadDialog vendorId={vendorId} vendorName={vendorName} />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("mentionUsHint")}</p>
      </div>

      {address && (
        <div className="border border-border bg-background p-6">
          <div className="mb-4 text-[10px] tracking-wider text-muted-foreground uppercase">{tVendor("links")}</div>
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{address}</span>
          </div>
        </div>
      )}
    </>
  );
}
