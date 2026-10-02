"use client";

import { useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { deleteVendor } from "./actions";

export function DeleteVendorButton({ vendorId, name }: { vendorId: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (confirm(`Удалить «${name}» насовсем? Вместе с ним удалятся все фото, заявки, статистика и избранное.`)) {
          startTransition(() => deleteVendor(vendorId));
        }
      }}
    >
      {pending ? "Удаляем…" : "Удалить подрядчика"}
    </Button>
  );
}
