"use client";

import { useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { deleteLead } from "./actions";

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (confirm("Удалить заявку насовсем?")) startTransition(() => deleteLead(leadId));
      }}
    >
      {pending ? "Удаляем…" : "Удалить заявку"}
    </Button>
  );
}
