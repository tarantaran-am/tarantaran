"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FormSelect } from "@/shared/components/FormSelect";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { CATEGORIES } from "@/shared/config/category";
import { MARZES } from "@/shared/config/marz";
import { SOCIAL_LABELS, SOCIAL_NETWORKS } from "@/shared/config/social";
import { submitApplication, type ApplicationFormState } from "./actions";
import { ApplicationPhotos } from "./ApplicationPhotos";
import {
  DESCRIPTION_MAX_LENGTH,
  MAX_PHOTOS,
  MIN_PHOTOS,
  NAME_MAX_LENGTH,
  type ApplicationField,
  type ApplicationValues,
} from "./schema";

const INITIAL_STATE: ApplicationFormState = { status: "idle" };

// The vendor's application for a card in the catalog. `mode` says whether it is the first one, an edit
// of one waiting for review, a fixed one after a rejection, or proposed changes to an approved card.
export function ApplicationForm({
  initialValues,
  mode,
}: {
  initialValues: ApplicationValues;
  mode: "new" | "pending" | "rejected" | "edit";
}) {
  const t = useTranslations("VendorApplication.form");
  const tCategory = useTranslations("Category");
  const [state, formAction, pending] = useActionState(submitApplication, INITIAL_STATE);
  const values = "values" in state ? state.values : initialValues;
  const invalid = (field: ApplicationField) => state.status === "invalid" && state.invalid.includes(field);
  const error = (field: ApplicationField) => (invalid(field) ? t(`errors.${field}`) : undefined);
  const categoryOptions = CATEGORIES.map((category) => ({ value: category, label: tCategory(`${category}.name`) }));
  // Uploading photos are not in the form yet, so it can't be sent until they finish.
  const [uploading, setUploading] = useState(false);

  return (
    // Base UI inputs don't accept a new defaultValue, so the form remounts with the returned values instead.
    <form key={JSON.stringify(values)} action={formAction} className="flex flex-col gap-8">
      <Section title={t("about")}>
        <Field label={t("name")} htmlFor="application-name" hint={t("nameHint")} error={error("name")}>
          <Input
            id="application-name"
            name="name"
            required
            maxLength={NAME_MAX_LENGTH}
            defaultValue={values.name}
            aria-invalid={invalid("name") || undefined}
          />
        </Field>
        <Field label={t("category")} htmlFor="application-category" error={error("category")}>
          <FormSelect
            id="application-category"
            name="category"
            required
            defaultValue={values.category}
            placeholder={t("categoryPlaceholder")}
            options={categoryOptions}
            invalid={invalid("category")}
          />
        </Field>
        <Field
          label={t("extraCategory")}
          htmlFor="application-extra-category"
          hint={t("extraCategoryHint")}
          error={error("extraCategory")}
        >
          <FormSelect
            id="application-extra-category"
            name="extraCategory"
            defaultValue={values.extraCategory}
            placeholder={t("extraCategoryNone")}
            options={[{ value: "", label: t("extraCategoryNone") }, ...categoryOptions]}
            invalid={invalid("extraCategory")}
          />
        </Field>
        <Field
          label={t("description")}
          htmlFor="application-description"
          hint={t("descriptionHint")}
          error={error("description")}
        >
          <DescriptionInput defaultValue={values.description} invalid={invalid("description")} />
        </Field>
      </Section>

      <Section title={t("photos")} hint={t("photosHint", { min: MIN_PHOTOS, max: MAX_PHOTOS })}>
        <ApplicationPhotos defaultPhotos={values.photos} onBusyChange={setUploading} error={error("photos")} />
      </Section>

      <Section title={t("marzes")}>
        <MarzPicker defaultSelected={values.marzes} error={error("marzes")} />
      </Section>

      <Section title={t("contacts")} hint={t("contactsHint")}>
        <Field label={t("phone")} htmlFor="application-phone" error={error("phone")}>
          <Input
            id="application-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+374 91 23 45 67"
            maxLength={30}
            defaultValue={values.phone}
            aria-invalid={invalid("phone") || undefined}
          />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SOCIAL_NETWORKS.map((network) => (
            <Field
              key={network}
              label={network === "website" ? t("website") : SOCIAL_LABELS[network]}
              htmlFor={`application-${network}`}
              error={error(network)}
            >
              <Input
                id={`application-${network}`}
                name={network}
                placeholder={network === "website" ? "example.am" : t("socialPlaceholder")}
                maxLength={300}
                autoComplete="off"
                spellCheck={false}
                defaultValue={values[network]}
                aria-invalid={invalid(network) || undefined}
              />
            </Field>
          ))}
        </div>
        {invalid("contact") && <p className="text-xs text-destructive">{t("errors.contact")}</p>}
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Button type="submit" size="lg" disabled={pending || uploading} className="sm:self-start">
          {pending ? t("submitting") : t(`submit.${mode}`)}
        </Button>
        <p aria-live="polite" className="text-sm">
          {state.status === "sent" && <span className="text-muted-foreground">{t("sent")}</span>}
          {state.status === "invalid" && <span className="text-destructive">{t("errors.invalid")}</span>}
          {state.status === "error" && <span className="text-destructive">{t("errors.generic")}</span>}
        </p>
      </div>
    </form>
  );
}

function MarzPicker({ defaultSelected, error }: { defaultSelected: string[]; error?: string }) {
  const tMarz = useTranslations("Marz");
  const t = useTranslations("VendorApplication.form");
  const [selected, setSelected] = useState(() => new Set(defaultSelected));
  const allSelected = selected.size === MARZES.length;
  const toggle = (value: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setSelected(allSelected ? new Set() : new Set(MARZES))}
        className="self-start text-sm text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
      >
        {allSelected ? t("clearMarzes") : t("allMarzes")}
      </button>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {MARZES.map((marz) => (
          <label key={marz} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="marzes"
              value={marz}
              checked={selected.has(marz)}
              onChange={() => toggle(marz)}
              className="size-4 accent-foreground"
            />
            {tMarz(marz)}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Grows with the text up to a fixed height, then scrolls; the counter shows how much room is left.
function DescriptionInput({ defaultValue, invalid }: { defaultValue: string; invalid: boolean }) {
  const [length, setLength] = useState(defaultValue.length);

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        id="application-description"
        name="description"
        rows={5}
        required
        maxLength={DESCRIPTION_MAX_LENGTH}
        defaultValue={defaultValue}
        onChange={(event) => setLength(event.target.value.length)}
        className="max-h-80 overflow-y-auto"
        aria-invalid={invalid || undefined}
      />
      <span className="self-end text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {length} / {DESCRIPTION_MAX_LENGTH}
      </span>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="mb-5 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {title}
        {hint && <span className="mt-1 block text-xs font-normal tracking-normal normal-case">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
