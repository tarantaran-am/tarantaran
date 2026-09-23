"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "@base-ui/react/dialog";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Modal, ModalHeader } from "@/shared/components/Modal";
import { SOCIAL_LABELS } from "@/shared/config/social";
import { submitLead, type LeadField, type LeadFormState } from "@/features/vendor/lead-action";
import { cn } from "cn";

const INITIAL_STATE: LeadFormState = { status: "idle" };

// Most visitors have an Armenian number, so the country code is typed in for them.
const PHONE_PREFIX = "+374 ";

// Remembered so a second request, to another vendor, doesn't ask for the same details again.
const SAVED_CONTACT_KEY = "tarantaran:lead-contact";

type SavedContact = { name?: string; phone?: string };

function readSavedContact(): SavedContact {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(SAVED_CONTACT_KEY) ?? "{}");
    if (!saved || typeof saved !== "object") return {};
    const { name, phone } = saved as Record<string, unknown>;
    return { name: typeof name === "string" ? name : undefined, phone: typeof phone === "string" ? phone : undefined };
  } catch {
    return {};
  }
}

function saveContact(event: FormEvent<HTMLFormElement>) {
  const data = new FormData(event.currentTarget);
  try {
    localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify({ name: data.get("name"), phone: data.get("phone") }));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); remembering is only a convenience.
  }
}

export function LeadDialog({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const t = useTranslations("LeadActions");

  return (
    <Modal
      closeLabel={t("close")}
      trigger={
        <Button variant="outline" size="lg" className="w-full">
          {t("form.open")}
        </Button>
      }
    >
      <LeadForm vendorId={vendorId} vendorName={vendorName} />
    </Modal>
  );
}

function LeadForm({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const t = useTranslations("LeadActions");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(submitLead.bind(null, vendorId, locale), INITIAL_STATE);
  // The form only mounts in the open dialog, on the client, so reading storage here is safe.
  const [saved] = useState(readSavedContact);

  if (state.status === "success") {
    return (
      <div className="pr-6">
        <Dialog.Title className="mb-3 font-serif text-2xl text-foreground">{t("submitted.title")}</Dialog.Title>
        <Dialog.Description className="mb-8 text-sm leading-relaxed text-muted-foreground">
          {t("submitted.desc")}
        </Dialog.Description>
        <Dialog.Close autoFocus className={cn(buttonVariants({ size: "lg" }), "w-full")}>
          {t("close")}
        </Dialog.Close>
      </div>
    );
  }

  const values = "values" in state ? state.values : undefined;
  const invalid = (field: LeadField) => state.status === "invalid" && state.invalid.includes(field);

  return (
    // Base UI inputs don't accept a new defaultValue, so the form remounts with the returned values instead.
    <form key={JSON.stringify(values ?? {})} action={formAction} onSubmit={saveContact} className="flex flex-col gap-5">
      <ModalHeader title={t("form.open")} description={vendorName} />

      <Field label={t("form.eventDate")} htmlFor="lead-event-date">
        <Input
          id="lead-event-date"
          name="eventDate"
          type="date"
          min={today()}
          defaultValue={values?.eventDate}
          aria-invalid={invalid("eventDate") || undefined}
        />
      </Field>

      <Field label={t("form.name")} htmlFor="lead-name" error={invalid("name") ? t("form.errors.name") : undefined}>
        <Input
          id="lead-name"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          defaultValue={values?.name ?? saved.name}
          aria-invalid={invalid("name") || undefined}
          aria-describedby={invalid("name") ? "lead-name-error" : undefined}
        />
      </Field>

      <Field label={t("form.phone")} htmlFor="lead-phone" error={invalid("phone") ? t("form.errors.phone") : undefined}>
        <Input
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          maxLength={30}
          autoComplete="tel"
          defaultValue={values?.phone ?? saved.phone ?? PHONE_PREFIX}
          aria-invalid={invalid("phone") || undefined}
          aria-describedby={invalid("phone") ? "lead-phone-error" : undefined}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm text-foreground">{t("form.contactVia")}</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {(["whatsapp", "telegram"] as const).map((network) => (
            <label key={network} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name={network}
                defaultChecked={values?.[network]}
                className="size-4 accent-foreground"
              />
              {SOCIAL_LABELS[network]}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={t("form.message")} htmlFor="lead-message">
        <Textarea
          id="lead-message"
          name="message"
          rows={3}
          maxLength={2000}
          defaultValue={values?.message}
          aria-invalid={invalid("message") || undefined}
        />
      </Field>

      {/* Honeypot for bots; see submitLead. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {(state.status === "error" || state.status === "limited") && (
        <p role="alert" className="text-sm text-destructive">
          {state.status === "limited" ? t("form.errors.tooMany") : t("form.errors.generic")}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// The visitor's local date as YYYY-MM-DD, the format <input type="date"> expects.
function today(): string {
  return new Date().toLocaleDateString("en-CA");
}
