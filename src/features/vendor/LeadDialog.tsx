"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/shared/components/ui/input-group";
import { Textarea } from "@/shared/components/ui/textarea";
import { Modal, ModalHeader } from "@/shared/components/Modal";
import { SOCIAL_LABELS } from "@/shared/config/social";
import {
  DEFAULT_PHONE_COUNTRY,
  OTHER_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  flagEmoji,
  formatPhoneDigits,
  isPhoneCountry,
  isValidPhone,
  phoneDialPrefix,
  phonePlaceholder,
} from "@/shared/lib/phone";
import { MESSAGE_MAX_LENGTH, eventDateBounds } from "@/features/vendor/lead-limits";
import { submitLead, type LeadField, type LeadFormState } from "@/features/vendor/lead-action";
import { cn } from "cn";

const INITIAL_STATE: LeadFormState = { status: "idle" };

// Remembered so a second request, to another vendor, doesn't ask for the same details again.
const SAVED_CONTACT_KEY = "tarantaran:lead-contact";

type SavedContact = { name?: string; phoneCountry?: string; phone?: string };

function readSavedContact(): SavedContact {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(SAVED_CONTACT_KEY) ?? "{}");
    if (!saved || typeof saved !== "object") return {};
    const { name, phoneCountry, phone } = saved as Record<string, unknown>;
    const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
    return { name: asString(name), phoneCountry: asString(phoneCountry), phone: asString(phone) };
  } catch {
    return {};
  }
}

function saveContact(event: FormEvent<HTMLFormElement>) {
  const data = new FormData(event.currentTarget);
  try {
    localStorage.setItem(
      SAVED_CONTACT_KEY,
      JSON.stringify({ name: data.get("name"), phoneCountry: data.get("phoneCountry"), phone: data.get("phone") }),
    );
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
  const dateBounds = eventDateBounds();
  const invalid = (field: LeadField) => state.status === "invalid" && state.invalid.includes(field);

  return (
    // Base UI inputs don't accept a new defaultValue, so the form remounts with the returned values instead.
    <form key={JSON.stringify(values ?? {})} action={formAction} onSubmit={saveContact} className="flex flex-col gap-5">
      <ModalHeader title={t("form.open")} description={vendorName} />

      <Field
        label={t("form.eventDate")}
        htmlFor="lead-event-date"
        error={invalid("eventDate") ? t("form.errors.eventDate") : undefined}
      >
        <DateInput
          id="lead-event-date"
          min={dateBounds.min}
          max={dateBounds.max}
          defaultValue={values?.eventDate ?? ""}
          invalid={invalid("eventDate")}
          invalidMessage={t("form.errors.eventDate")}
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
        <PhoneInput
          id="lead-phone"
          defaultCountry={values?.phoneCountry ?? saved.phoneCountry ?? DEFAULT_PHONE_COUNTRY}
          defaultValue={values?.phone ?? saved.phone ?? ""}
          invalidMessage={t("form.errors.phone")}
          invalid={invalid("phone")}
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

      <Field
        label={t("form.message")}
        htmlFor="lead-message"
        error={invalid("message") ? t("form.errors.message", { max: MESSAGE_MAX_LENGTH }) : undefined}
      >
        <MessageInput id="lead-message" defaultValue={values?.message ?? ""} invalid={invalid("message")} />
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

      <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">
        {t.rich("form.consent", {
          link: (chunks) => (
            // A new tab, so reading the policy doesn't lose what was typed into the form.
            <Link
              href="/privacy"
              target="_blank"
              className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}

// A country picker (Armenia by default) in front of the number; the digits are grouped the way that
// country writes them and capped at its length. The browser blocks submitting an incomplete number.
function PhoneInput({
  id,
  defaultCountry,
  defaultValue,
  invalidMessage,
  invalid,
}: {
  id: string;
  defaultCountry: string;
  defaultValue: string;
  invalidMessage: string;
  invalid: boolean;
}) {
  const t = useTranslations("LeadActions");
  const locale = useLocale();
  const [country, setCountry] = useState(() =>
    isPhoneCountry(defaultCountry) ? defaultCountry : DEFAULT_PHONE_COUNTRY,
  );
  const [value, setValue] = useState(() => formatPhoneDigits(country, defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.setCustomValidity(value && !isValidPhone(country, value) ? invalidMessage : "");
  }, [country, value, invalidMessage]);

  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const countryName = (iso: string) =>
    iso === OTHER_PHONE_COUNTRY ? t("form.otherCountry") : (regionNames.of(iso) ?? iso);

  return (
    <InputGroup>
      <InputGroupAddon className="relative">
        {/* The short label is what shows; the transparent native select on top opens the full list. */}
        <InputGroupText className="gap-1 text-foreground" aria-hidden="true">
          <span>{flagEmoji(country)}</span>
          <span>{phoneDialPrefix(country)}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </InputGroupText>
        <select
          name="phoneCountry"
          value={country}
          aria-label={t("form.phoneCountry")}
          // The addon moves focus to the number input on click, which would snap the list shut.
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            const next = event.target.value;
            setCountry(next);
            setValue(formatPhoneDigits(next, value));
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {PHONE_COUNTRIES.map(({ iso, dial }) => (
            <option key={iso} value={iso}>
              {`${flagEmoji(iso)} ${countryName(iso)} ${dial}`}
            </option>
          ))}
          <option
            value={OTHER_PHONE_COUNTRY}
          >{`${flagEmoji(OTHER_PHONE_COUNTRY)} ${countryName(OTHER_PHONE_COUNTRY)}`}</option>
        </select>
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        id={id}
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        required
        placeholder={country === OTHER_PHONE_COUNTRY ? t("form.otherCountryPlaceholder") : phonePlaceholder(country)}
        value={value}
        onChange={(event) => setValue(formatPhoneDigits(country, event.target.value))}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
      />
    </InputGroup>
  );
}

// The browser lets a year like 9999 be typed despite min/max and only complains on submit,
// so the range error is shown as soon as the field is left.
function DateInput({
  id,
  min,
  max,
  defaultValue,
  invalid,
  invalidMessage,
}: {
  id: string;
  min: string;
  max: string;
  defaultValue: string;
  invalid: boolean;
  invalidMessage: string;
}) {
  const [outOfRange, setOutOfRange] = useState(false);
  const showError = invalid || outOfRange;
  const check = (input: HTMLInputElement) =>
    setOutOfRange(input.validity.rangeOverflow || input.validity.rangeUnderflow || input.validity.badInput);

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        id={id}
        name="eventDate"
        type="date"
        min={min}
        max={max}
        defaultValue={defaultValue}
        onBlur={(event) => check(event.currentTarget)}
        onChange={(event) => outOfRange && check(event.currentTarget)}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? `${id}-error` : undefined}
      />
      {outOfRange && !invalid && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {invalidMessage}
        </p>
      )}
    </div>
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

// Grows with the text up to a fixed height, then scrolls; the counter shows how much room is left.
function MessageInput({ id, defaultValue, invalid }: { id: string; defaultValue: string; invalid: boolean }) {
  const [length, setLength] = useState(defaultValue.length);

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        id={id}
        name="message"
        rows={3}
        maxLength={MESSAGE_MAX_LENGTH}
        defaultValue={defaultValue}
        onChange={(event) => setLength(event.target.value.length)}
        className="max-h-40 overflow-y-auto"
        aria-invalid={invalid || undefined}
      />
      <span className="self-end text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {length} / {MESSAGE_MAX_LENGTH}
      </span>
    </div>
  );
}
