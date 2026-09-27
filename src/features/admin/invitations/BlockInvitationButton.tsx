"use client";

import { useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { setInvitationBlocked } from "./actions";

export function BlockInvitationButton({ id, blocked }: { id: string; blocked: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={blocked ? "outline" : "destructive"}
      disabled={pending}
      onClick={() => {
        if (blocked || confirm("Снять приглашение с публикации? Пара не сможет опубликовать его снова.")) {
          startTransition(() => setInvitationBlocked(id, !blocked));
        }
      }}
    >
      {blocked ? "Вернуть" : "Снять"}
    </Button>
  );
}
