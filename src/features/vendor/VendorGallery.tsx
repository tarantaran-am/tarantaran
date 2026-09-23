"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PHOTO_PLACEHOLDER } from "@/shared/lib/photo";

export function VendorGallery({ photos: approved, name }: { photos: string[]; name: string }) {
  const t = useTranslations("VendorGallery");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const photos = approved.length > 0 ? approved : [PHOTO_PLACEHOLDER];
  const current = photos[active] ?? PHOTO_PLACEHOLDER;
  const step = (delta: number) => setActive((i) => (i + delta + photos.length) % photos.length);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("openFullscreen")}
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-muted"
      >
        <Image
          src={current}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="scale-110 object-cover blur-2xl"
        />
        <Image
          src={current}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-contain"
        />
      </Dialog.Trigger>

      {photos.length > 1 && (
        <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}>
          {photos.map((photo, i) => (
            <button
              type="button"
              key={photo}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-muted transition-opacity ${
                i === active ? "opacity-100 ring-2 ring-foreground" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={t("photoLabel", { index: i + 1 })}
            >
              <Image src={photo} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog.Portal>
        {/* The popup covers the whole screen, so a click on its own background acts as the backdrop click. */}
        <Dialog.Popup
          aria-label={name}
          initialFocus={closeRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
          }}
        >
          <Dialog.Close
            ref={closeRef}
            aria-label={t("close")}
            className="absolute top-6 right-6 text-foreground transition-opacity hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </Dialog.Close>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t("prev")}
                className="absolute left-4 text-foreground transition-opacity hover:opacity-70 md:left-8"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t("next")}
                className="absolute right-4 text-foreground transition-opacity hover:opacity-70 md:right-8"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative h-[80vh] w-[90vw] max-w-5xl">
            <Image src={current} alt={name} fill sizes="90vw" className="object-contain" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
