"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { PHOTO_ACCEPT } from "@/shared/lib/photo/limits";
import { preparePhoto, uploadToSignedUrl } from "@/shared/lib/photo/prepare-photo";
import { cn } from "cn";
import { requestApplicationPhotoUpload } from "./actions";
import { MAX_PHOTOS } from "./schema";

const iconButton =
  "flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background disabled:opacity-40 [&_svg]:size-4";

// Photos of work for the application: scaled down in the browser and uploaded straight to Storage;
// the form sends their URLs, in the order shown. The first one becomes the card's cover.
export function ApplicationPhotos({
  defaultPhotos,
  onBusyChange,
  error,
}: {
  defaultPhotos: string[];
  onBusyChange: (busy: boolean) => void;
  error?: string;
}) {
  const t = useTranslations("VendorApplication.form");
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(defaultPhotos);
  const [uploading, setUploading] = useState(0);
  const [failed, setFailed] = useState(0);
  const free = MAX_PHOTOS - photos.length - uploading;

  // One file at a time, so photos land in the order they were picked. Extra files over the limit are skipped.
  async function upload(files: File[]) {
    const batch = files.slice(0, free);
    if (batch.length === 0) return;
    setFailed(0);
    setUploading((count) => count + batch.length);
    onBusyChange(true);
    for (const file of batch) {
      try {
        const { blob, extension } = await preparePhoto(file);
        const ticket = await requestApplicationPhotoUpload(extension);
        if ("error" in ticket) throw new Error(ticket.error);
        await uploadToSignedUrl(ticket.uploadUrl, blob);
        setPhotos((current) => [...current, ticket.url]);
      } catch {
        setFailed((count) => count + 1);
      } finally {
        setUploading((count) => count - 1);
      }
    }
    onBusyChange(false);
  }

  function move(index: number, delta: -1 | 1) {
    setPhotos((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta]!, next[index]!];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((url, index) => (
          <li key={url} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
            <input type="hidden" name="photos" value={url} />
            <Image src={url} alt="" fill sizes="(min-width: 768px) 180px, 45vw" className="object-cover" />
            {index === 0 && (
              <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground">
                {t("cover")}
              </span>
            )}
            <button
              type="button"
              aria-label={t("removePhoto")}
              onClick={() => setPhotos((current) => current.filter((item) => item !== url))}
              className={cn(iconButton, "absolute top-2 right-2")}
            >
              <X />
            </button>
            <div className="absolute right-2 bottom-2 left-2 flex justify-between">
              <button
                type="button"
                aria-label={t("movePhotoLeft")}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className={iconButton}
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                aria-label={t("movePhotoRight")}
                disabled={index === photos.length - 1}
                onClick={() => move(index, 1)}
                className={iconButton}
              >
                <ChevronRight />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, index) => (
          <li
            key={`uploading-${index}`}
            className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          >
            <LoaderCircle className="size-5 animate-spin" aria-label={t("uploading")} />
          </li>
        ))}
        {free > 0 && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className={cn(
                "flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-3 text-center text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground",
                error && "border-destructive",
              )}
            >
              <ImagePlus className="size-5" />
              {t("addPhotos")}
              <span className="text-xs tabular-nums">
                {photos.length} / {MAX_PHOTOS}
              </span>
            </button>
          </li>
        )}
      </ul>
      <input
        ref={input}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void upload(files);
        }}
      />
      {failed > 0 && (
        <p role="alert" className="text-xs text-destructive">
          {t("errors.upload", { count: failed })}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
