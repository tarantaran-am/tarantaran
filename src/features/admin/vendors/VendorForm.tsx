"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { SOCIAL_LABELS, SOCIAL_NETWORKS } from "@/shared/config/social";
import { saveVendor, type VendorFormState } from "./actions";
import { VENDOR_FIELD_ERRORS, type VendorField, type VendorFormValues } from "./schema";
import type { VendorOptions } from "./queries";

const EMPTY_VALUES: VendorFormValues = {
  slug: "",
  nameRu: "",
  nameHy: "",
  nameEn: "",
  descriptionRu: "",
  descriptionHy: "",
  descriptionEn: "",
  category: "",
  phone: "",
  address: "",
  marzes: [],
  isPublished: false,
  ...(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, ""])) as Record<
    (typeof SOCIAL_NETWORKS)[number],
    string
  >),
};

const LANGUAGES = [
  { suffix: "Ru", label: "на русском" },
  { suffix: "Hy", label: "на армянском" },
  { suffix: "En", label: "на английском" },
] as const;

const selectClass =
  "h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive";

export function VendorForm({
  vendorId,
  initialValues,
  options,
}: {
  vendorId: string | null;
  initialValues?: VendorFormValues;
  options: VendorOptions;
}) {
  const [state, formAction, pending] = useActionState<VendorFormState, FormData>(saveVendor.bind(null, vendorId), {
    status: "idle",
  });
  const values = state.status === "idle" ? (initialValues ?? EMPTY_VALUES) : state.values;
  const invalid = (field: VendorField) => state.status === "invalid" && state.invalid.includes(field);
  const error = (field: VendorField) => {
    if (!invalid(field)) return undefined;
    if (field === "slug" && state.status === "invalid" && state.slugTaken) return "Такой адрес уже занят.";
    return VENDOR_FIELD_ERRORS[field] ?? "Проверьте значение.";
  };

  return (
    // Base UI inputs don't accept a new defaultValue, so the form remounts with the returned values instead.
    <form key={JSON.stringify(values)} action={formAction} className="flex max-w-3xl flex-col gap-10">
      <Section title="Основное">
        {LANGUAGES.map(({ suffix, label }) => {
          const field = `name${suffix}` as const;
          return (
            <Field
              key={field}
              label={`Название ${label}`}
              htmlFor={field}
              required={suffix === "Ru"}
              error={error(field)}
            >
              <Input
                id={field}
                name={field}
                defaultValue={values[field]}
                maxLength={120}
                aria-invalid={invalid(field) || undefined}
              />
            </Field>
          );
        })}
        <Field label="Категория" htmlFor="category" required error={error("category")}>
          <select
            id="category"
            name="category"
            defaultValue={values.category}
            className={selectClass}
            aria-invalid={invalid("category") || undefined}
          >
            <option value="" disabled>
              Выберите категорию
            </option>
            {options.categories.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Адрес страницы (slug)"
          htmlFor="slug"
          required
          error={error("slug")}
          hint={
            vendorId
              ? "Если изменить адрес или категорию, старая ссылка на подрядчика перестанет открываться."
              : "Часть ссылки: tarantaran.am/ru/catalog/<категория>/<адрес>. Например: dj_goodmen."
          }
        >
          <Input
            id="slug"
            name="slug"
            defaultValue={values.slug}
            maxLength={60}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={invalid("slug") || undefined}
          />
        </Field>
      </Section>

      <Section title="Описание">
        {LANGUAGES.map(({ suffix, label }) => {
          const field = `description${suffix}` as const;
          return (
            <Field
              key={field}
              label={`Описание ${label}`}
              htmlFor={field}
              required={suffix === "Ru"}
              error={error(field)}
            >
              <Textarea
                id={field}
                name={field}
                rows={4}
                maxLength={5000}
                defaultValue={values[field]}
                className="max-h-80 overflow-y-auto"
                aria-invalid={invalid(field) || undefined}
              />
            </Field>
          );
        })}
      </Section>

      <Section title="Контакты">
        <Field label="Телефон" htmlFor="phone" required error={error("phone")}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={values.phone}
            placeholder="+374 91 23 45 67"
            maxLength={30}
            aria-invalid={invalid("phone") || undefined}
          />
        </Field>
        <Field label="Адрес" htmlFor="address" error={error("address")}>
          <Input id="address" name="address" defaultValue={values.address} maxLength={300} />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SOCIAL_NETWORKS.map((network) => (
            <Field
              key={network}
              label={network === "website" ? "Сайт" : SOCIAL_LABELS[network]}
              htmlFor={network}
              error={invalid(network) ? "Ссылка или ник без пробелов." : undefined}
            >
              <Input
                id={network}
                name={network}
                defaultValue={values[network]}
                placeholder={network === "website" ? "example.am" : "@username или ссылка"}
                maxLength={300}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={invalid(network) || undefined}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Где работает">
        <MarzPicker options={options.marzes} defaultSelected={values.marzes} error={error("marzes")} />
      </Section>

      <Section title="Публикация">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={values.isPublished}
            className="size-4 accent-foreground"
          />
          Показывать на сайте
        </label>
      </Section>

      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-border bg-background/95 px-6 py-4 lg:-mx-12 lg:px-12">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Сохраняем…" : vendorId ? "Сохранить" : "Создать подрядчика"}
        </Button>
        <p aria-live="polite" className="text-sm">
          {state.status === "saved" && <span className="text-muted-foreground">Сохранено, сайт обновлён.</span>}
          {state.status === "invalid" && <span className="text-destructive">Исправьте отмеченные поля.</span>}
          {state.status === "error" && (
            <span className="text-destructive">Не удалось сохранить. Попробуйте ещё раз.</span>
          )}
        </p>
      </div>
    </form>
  );
}

function MarzPicker({
  options,
  defaultSelected,
  error,
}: {
  options: VendorOptions["marzes"];
  defaultSelected: string[];
  error?: string;
}) {
  const [selected, setSelected] = useState(() => new Set(defaultSelected));
  const allSelected = selected.size === options.length;
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
        onClick={() => setSelected(allSelected ? new Set() : new Set(options.map((option) => option.value)))}
        className="self-start text-sm text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
      >
        {allSelected ? "Снять все" : "Вся Армения"}
      </button>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {options.map(({ value, label }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="marzes"
              value={value}
              checked={selected.has(value)}
              onChange={() => toggle(value)}
              className="size-4 accent-foreground"
            />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="mb-5 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}
        {required && <span className="text-muted-foreground"> *</span>}
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
