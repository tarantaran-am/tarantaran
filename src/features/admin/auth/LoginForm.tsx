"use client";

import { useActionState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Logo } from "@/features/admin/AdminLogo";
import { login, type LoginState } from "./actions";

const ERRORS: Record<NonNullable<LoginState["error"]>, string> = {
  invalid: "Неверный пароль.",
  disabled: "Вход не настроен: задайте ADMIN_PASSWORD_HASH и ADMIN_SESSION_SECRET.",
};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(login, configured ? {} : { error: "disabled" });

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
        <Logo />
        <div>
          <h1 className="font-serif text-2xl text-foreground">Вход в админку</h1>
          <p className="mt-1 text-sm text-muted-foreground">Только для команды Taran Taran.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-password" className="text-sm text-foreground">
            Пароль
          </label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            disabled={!configured}
            aria-invalid={state.error === "invalid" || undefined}
          />
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {ERRORS[state.error]}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || !configured}>
          {pending ? "Проверяем…" : "Войти"}
        </Button>
      </form>
    </main>
  );
}
