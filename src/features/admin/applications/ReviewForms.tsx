"use client";

import { useActionState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { approveApplication, rejectApplication, type ReviewFormState } from "./actions";
import { ADMIN_MESSAGE_MAX_LENGTH } from "./limits";

const INITIAL_STATE: ReviewFormState = { status: "idle" };

// `suggestedSlug` is null for proposed changes to an existing card.
export function ApproveForm({ id, suggestedSlug }: { id: string; suggestedSlug: string | null }) {
  const [state, formAction, pending] = useActionState(approveApplication.bind(null, id), INITIAL_STATE);
  const values = "slug" in state ? state : { slug: suggestedSlug ?? "", message: "" };
  // The message is capped by maxLength, so in practice only the address can be invalid.
  const slugError =
    state.status !== "invalid"
      ? undefined
      : state.slugTaken
        ? "Такой адрес уже занят."
        : "Латиница, цифры, «-» или «_», от 2 до 60 символов.";

  return (
    <form key={JSON.stringify(values)} action={formAction} className="flex flex-col gap-4">
      {/* Changes to an existing card keep its address. */}
      {suggestedSlug !== null && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="approve-slug" className="text-sm text-foreground">
            Адрес страницы (slug)
          </label>
          <Input
            id="approve-slug"
            name="slug"
            required
            maxLength={60}
            autoComplete="off"
            spellCheck={false}
            defaultValue={values.slug}
            aria-invalid={Boolean(slugError) || undefined}
          />
          {slugError ? (
            <p className="text-xs text-destructive">{slugError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">tarantaran.am/ru/catalog/&lt;категория&gt;/&lt;адрес&gt;</p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="approve-message" className="text-sm text-foreground">
          Сообщение подрядчику <span className="text-muted-foreground">(необязательно)</span>
        </label>
        <Textarea
          id="approve-message"
          name="message"
          rows={3}
          maxLength={ADMIN_MESSAGE_MAX_LENGTH}
          defaultValue={values.message}
          placeholder={suggestedSlug === null ? "Например: обновили карточку, спасибо!" : "Например: добро пожаловать!"}
          className="max-h-60 overflow-y-auto"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {suggestedSlug === null
          ? "Изменения сразу попадут в карточку на сайте. Тексты меняются в русской версии — армянскую и английскую проверьте сами."
          : "Создастся скрытая карточка с данными и фото из анкеты — проверьте её и отметьте «Показывать на сайте»."}
      </p>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : suggestedSlug === null ? "Применить изменения" : "Одобрить и создать карточку"}
        </Button>
        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            Не удалось одобрить. Обновите страницу и попробуйте ещё раз.
          </p>
        )}
      </div>
    </form>
  );
}

export function RejectForm({ id, defaultMessage }: { id: string; defaultMessage: string }) {
  const [state, formAction, pending] = useActionState(rejectApplication.bind(null, id), INITIAL_STATE);
  const message = "message" in state ? state.message : defaultMessage;

  return (
    <form key={message} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reject-message" className="text-sm text-foreground">
          Что исправить
        </label>
        <Textarea
          id="reject-message"
          name="message"
          rows={4}
          required
          maxLength={ADMIN_MESSAGE_MAX_LENGTH}
          defaultValue={message}
          placeholder="Подрядчик увидит это сообщение в своём кабинете."
          className="max-h-60 overflow-y-auto"
          aria-invalid={state.status === "invalid" || undefined}
        />
        {state.status === "invalid" && <p className="text-xs text-destructive">Напишите, что нужно исправить.</p>}
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Отправляем…" : "Вернуть на доработку"}
        </Button>
        <p aria-live="polite" className="text-sm">
          {state.status === "saved" && <span className="text-muted-foreground">Отправлено подрядчику.</span>}
          {state.status === "error" && <span className="text-destructive">Не удалось отправить.</span>}
        </p>
      </div>
    </form>
  );
}
