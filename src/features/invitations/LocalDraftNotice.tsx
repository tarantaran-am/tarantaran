"use client";

import { useEffect, useEffectEvent, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { buttonVariants } from "@/shared/components/ui/button";
import { readLocalDraft, wantsPublishAfterSignIn } from "./local-draft";

const subscribeNothing = () => () => {};

// Signing in lands here, not in the builder. A draft the guest made before is still in the browser:
// offer to continue it, or, when they pressed "Publish", take them straight back to finish that.
export function LocalDraftNotice() {
  const t = useTranslations("Invitations.panel");
  const router = useRouter();
  const hasDraft = useSyncExternalStore(
    subscribeNothing,
    () => readLocalDraft() !== null,
    () => false,
  );

  const resumePublish = useEffectEvent(() => {
    if (hasDraft && wantsPublishAfterSignIn()) router.replace("/invitations/new");
  });
  useEffect(() => resumePublish(), []);

  if (!hasDraft) return null;
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-muted/50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-foreground">{t("localDraft")}</p>
      <Link href="/invitations/new" className={buttonVariants({ size: "sm" })}>
        {t("continue")}
      </Link>
    </div>
  );
}
