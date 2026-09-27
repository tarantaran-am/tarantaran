"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Modal, ModalClose, ModalHeader } from "@/shared/components/Modal";
import { Button } from "@/shared/components/ui/button";
import { deleteInvitation } from "./actions";

export function DeleteInvitationButton({ id }: { id: string }) {
  const t = useTranslations("Invitations");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Modal
      closeLabel={t("deleteDialog.close")}
      trigger={
        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          {t("delete")}
        </Button>
      }
    >
      <ModalHeader title={t("deleteDialog.title")} description={t("deleteDialog.text")} />
      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ModalClose render={<Button type="button" variant="outline" size="lg" disabled={pending} />}>
          {t("deleteDialog.cancel")}
        </ModalClose>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteInvitation(id);
              router.refresh();
            })
          }
        >
          {pending ? t("deleteDialog.deleting") : t("delete")}
        </Button>
      </div>
    </Modal>
  );
}
