import { useTranslations } from "next-intl";
import { cn } from "cn";
import { RingsMark } from "@/shared/components/RingsMark";

export function Logo({ className }: { className?: string }) {
  const t = useTranslations("Brand");
  const word = t("wordmark");

  return (
    <span
      aria-label={t("name")}
      className={cn("inline-flex items-center gap-[0.5em] font-serif tracking-[0.18em] text-foreground", className)}
    >
      <span aria-hidden>{word}</span>
      <RingsMark className="h-[1.9em] w-auto shrink-0 text-primary" />
      <span aria-hidden>{word}</span>
    </span>
  );
}
