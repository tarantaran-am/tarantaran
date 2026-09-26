"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { MailCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { requestEmailLink, type EmailLinkState } from "./email-action";
import { Turnstile } from "./Turnstile";

const INITIAL_STATE: EmailLinkState = { status: "idle", email: "", attempt: 0 };

export function EmailSignIn({ locale, siteKey }: { locale: string; siteKey: string }) {
  const t = useTranslations("Auth.email");
  const [state, formAction, pending] = useActionState(requestEmailLink, INITIAL_STATE);
  // "Send again" brings the form back without forgetting what was sent.
  const [dismissedAttempt, setDismissedAttempt] = useState(0);
  // The attempt Turnstile last passed for: each attempt gets a new widget and needs a new pass.
  const [verifiedAttempt, setVerifiedAttempt] = useState<number | null>(null);
  const verified = verifiedAttempt === state.attempt;

  if (state.status === "sent" && state.attempt !== dismissedAttempt) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-2xl bg-muted p-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-background">
          <MailCheck className="size-[18px]" strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-[15px] font-medium text-foreground">{t("sentTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t.rich("sentText", {
              email: state.email,
              b: (chunks) => <b className="font-medium text-foreground">{chunks}</b>,
            })}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{t("sentHint")}</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissedAttempt(state.attempt)}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("again")}
        </button>
      </div>
    );
  }

  const error = state.status === "idle" || state.status === "sent" ? null : state.status;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="auth-email" className="text-sm font-medium text-foreground">
        {t("label")}
      </label>
      <Input
        id="auth-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
        defaultValue={state.email}
        placeholder={t("placeholder")}
        aria-invalid={error === "invalid" || undefined}
        aria-describedby={error ? "auth-email-error" : undefined}
        className="h-12 rounded-full px-5 text-[15px]"
      />
      <input type="hidden" name="locale" value={locale} />
      {/* A new widget per attempt: a Turnstile token can be checked only once. */}
      <Turnstile
        key={state.attempt}
        siteKey={siteKey}
        locale={locale}
        onVerifiedChange={(passed) => setVerifiedAttempt(passed ? state.attempt : null)}
      />
      {error && (
        <p id="auth-email-error" role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      )}
      <Button type="submit" size="lg" className="h-12 w-full text-[15px]" disabled={pending || !verified}>
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
