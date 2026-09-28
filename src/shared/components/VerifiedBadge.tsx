import { useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

// A span, not the default button: the badge sits inside the vendor card's link.
export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations("VerifiedBadge");

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span role="img" aria-label={t("tooltip")} />}
        className={cn("inline-flex shrink-0 align-middle", className)}
      >
        <BadgeCheck className="size-full fill-primary text-primary-foreground" aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{t("tooltip")}</TooltipContent>
    </Tooltip>
  );
}
