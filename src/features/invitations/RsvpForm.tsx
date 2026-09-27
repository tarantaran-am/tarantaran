"use client";

import { useActionState, useState } from "react";
import { cn } from "cn";
import { controlTrigger } from "@/shared/components/control-styles";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { MAX_GUESTS } from "./content";
import { submitRsvp, type RsvpState } from "./rsvp-action";
import type { InvitationTheme } from "./themes";
import { invitationTranslator, type InvitationMessages } from "./translator";
import { formatDay, type InvitationView } from "./view";

// "1" … "10": the value goes into the form as a string, like any field.
const GUEST_COUNTS = Object.fromEntries(
  Array.from({ length: MAX_GUESTS }, (_, index) => [String(index + 1), String(index + 1)]),
);

// `slug` is null in the builder's preview: the form looks the same but does not send anything.
export function RsvpForm({
  slug,
  view,
  messages,
  theme,
  closed = false,
}: {
  slug: string | null;
  view: InvitationView;
  messages: InvitationMessages;
  theme: InvitationTheme;
  closed?: boolean;
}) {
  const t = invitationTranslator(view.language, messages);
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(
    slug ? submitRsvp.bind(null, slug) : async () => ({ status: "idle" }),
    { status: "idle" },
  );
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  // "Reply for another guest" brings the form back after a reply.
  const [answered, setAnswered] = useState<RsvpState | null>(null);
  const showThanks = state.status === "sent" && answered !== state;

  return (
    <section className={cn("rounded-3xl p-6", theme.card)}>
      <h2 className={cn("text-center", theme.heading)}>{t("rsvp.title")}</h2>
      {view.rsvpDeadline && !closed && (
        <p className={cn("mt-2 text-center text-sm", theme.muted)}>
          {t("rsvp.deadline", { date: formatDay(view.rsvpDeadline, view.language) })}
        </p>
      )}

      {closed || state.status === "closed" ? (
        <p className={cn("mt-6 text-center text-[15px]", theme.muted)}>{t("rsvp.closed")}</p>
      ) : showThanks ? (
        <div role="status" className="mt-6 text-center">
          <p className="text-[15px]">{t("rsvp.thanks")}</p>
          <button
            type="button"
            onClick={() => setAnswered(state)}
            className={cn("mt-4 text-sm underline underline-offset-4", theme.muted)}
          >
            {t("rsvp.another")}
          </button>
        </div>
      ) : (
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <Input
            name="name"
            required
            maxLength={80}
            autoComplete="name"
            placeholder={t("rsvp.name")}
            aria-label={t("rsvp.name")}
            className={cn("h-12 px-4 text-[15px] md:text-[15px]", theme.input)}
          />
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {(["yes", "no"] as const).map((value) => (
              <label
                key={value}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto cursor-pointer py-3 text-center whitespace-normal has-checked:border-current",
                  theme.input,
                  attending === value && theme.accent,
                )}
              >
                <input
                  type="radio"
                  name="attending"
                  value={value}
                  checked={attending === value}
                  onChange={() => setAttending(value)}
                  className="sr-only"
                />
                {t(value === "yes" ? "rsvp.attending" : "rsvp.declining")}
              </label>
            ))}
          </div>
          {attending === "yes" && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span id="rsvp-guests" className={theme.muted}>
                {t("rsvp.guests")}
              </span>
              <Select name="guests" defaultValue="1" items={GUEST_COUNTS}>
                <SelectTrigger aria-labelledby="rsvp-guests" className={cn(controlTrigger, "w-20")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="p-1.5">
                  {Object.keys(GUEST_COUNTS).map((count) => (
                    <SelectItem key={count} value={count}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Textarea
            name="comment"
            rows={2}
            maxLength={500}
            placeholder={t("rsvp.comment")}
            aria-label={t("rsvp.comment")}
            className={cn("px-4 text-[15px] md:text-[15px]", theme.input)}
          />
          {/* Honeypot, hidden from people. */}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          {(state.status === "invalid" || state.status === "limited" || state.status === "error") && (
            <p role="alert" className="text-sm text-red-700">
              {t(`rsvp.errors.${state.status}`)}
            </p>
          )}
          <Button type="submit" size="lg" disabled={pending || !slug} className={cn("h-12 text-[15px]", theme.button)}>
            {pending ? t("rsvp.sending") : t("rsvp.submit")}
          </Button>
        </form>
      )}
    </section>
  );
}
