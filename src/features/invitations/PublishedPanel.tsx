"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "cn";

// The link to send to guests, with the ways couples actually send it.
export function PublishedPanel({ url }: { url: string }) {
  const t = useTranslations("Invitations");
  const [copied, setCopied] = useState(false);
  const share = encodeURIComponent(url);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div role="status" className="rounded-[20px] border border-border bg-muted/50 p-5">
      <p className="text-[15px] font-medium text-foreground">{t("published.title")}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-sm break-all text-foreground underline-offset-4 hover:underline"
      >
        {url}
        <ExternalLink className="size-3.5 shrink-0" />
      </a>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? t("published.copied") : t("published.copy")}
        </button>
        <a
          href={`https://wa.me/?text=${share}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {t("published.whatsapp")}
        </a>
        <a
          href={`https://t.me/share/url?url=${share}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {t("published.telegram")}
        </a>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{t("published.note")}</p>
    </div>
  );
}
