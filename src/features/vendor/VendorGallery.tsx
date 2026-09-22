"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PHOTO_PLACEHOLDER } from "@/shared/lib/photo";

export function VendorGallery({ photos: approved, name }: { photos: string[]; name: string }) {
  const t = useTranslations("VendorGallery");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const photos = approved.length > 0 ? approved : [PHOTO_PLACEHOLDER];

  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % photos.length);
      if (e.key === "Tab") trapFocus(e);
    }
    function trapFocus(e: KeyboardEvent) {
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
      const first = buttons?.[0];
      const last = buttons?.[buttons.length - 1];
      if (!first || !last) return;
      const current = document.activeElement;
      const inside = dialogRef.current?.contains(current) ?? false;
      if (e.shiftKey && (current === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  return (
    <div>
      <button
        type="button"
        ref={openerRef}
        onClick={() => setOpen(true)}
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-muted"
        aria-label={t("openFullscreen")}
      >
        <Image
          src={photos[active] ?? PHOTO_PLACEHOLDER}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="scale-110 object-cover blur-2xl"
        />
        <Image
          src={photos[active] ?? PHOTO_PLACEHOLDER}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-contain"
        />
      </button>
      {photos.length > 1 && (
        <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}>
          {photos.map((photo, i) => (
            <button
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

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={name}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            ref={closeRef}
            onClick={() => setOpen(false)}
            aria-label={t("close")}
            className="absolute top-6 right-6 text-foreground transition-opacity hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + photos.length) % photos.length);
                }}
                aria-label={t("prev")}
                className="absolute left-4 text-foreground transition-opacity hover:opacity-70 md:left-8"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % photos.length);
                }}
                aria-label={t("next")}
                className="absolute right-4 text-foreground transition-opacity hover:opacity-70 md:right-8"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="relative h-[80vh] w-[90vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[active] ?? PHOTO_PLACEHOLDER} alt={name} fill sizes="90vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
