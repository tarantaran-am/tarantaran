"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { PHOTO_ACCEPT } from "@/shared/lib/photo/limits";
import { preparePhoto, uploadToSignedUrl } from "@/shared/lib/photo/prepare-photo";
import { removeInvitationPhoto, requestInvitationPhotoUpload, setInvitationPhoto } from "./actions";

// The couple's photo: scaled down in the browser, uploaded straight to Storage, then attached.
export function PhotoField({
  invitationId,
  photoUrl,
  onChange,
}: {
  invitationId: string;
  photoUrl: string | undefined;
  onChange: (photoUrl: string | undefined) => void;
}) {
  const t = useTranslations("Invitations");
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setFailed(false);
    try {
      const { blob, extension } = await preparePhoto(file);
      const request = await requestInvitationPhotoUpload(invitationId, extension);
      if ("error" in request) throw new Error(request.error);
      await uploadToSignedUrl(request.uploadUrl, blob);
      const result = await setInvitationPhoto(invitationId, request.path);
      if ("error" in result) throw new Error(result.error);
      onChange(result.photoUrl);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    await removeInvitationPhoto(invitationId);
    onChange(undefined);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {photoUrl && (
        <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-2xl bg-muted">
          <Image src={photoUrl} alt="" fill sizes="320px" className="object-cover" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? t("uploading") : photoUrl ? t("replace") : t("upload")}
        </Button>
        {photoUrl && (
          <Button type="button" variant="ghost" disabled={busy} onClick={remove}>
            {t("remove")}
          </Button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={PHOTO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {t("photoError")}
        </p>
      )}
    </div>
  );
}
