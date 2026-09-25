"use client";

import { useRef, useState, useTransition, type DragEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Star, Trash2, Upload } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/shared/components/ui/button";
import { addPhoto, deletePhoto, reorderPhotos, requestPhotoUpload, setCoverPhoto, setPhotoVisible } from "./actions";
import { MAX_PHOTOS } from "./limits";
import { preparePhoto, uploadToSignedUrl } from "./prepare-photo";

export type AdminPhoto = { id: string; url: string; isCover: boolean; isApproved: boolean };

type Upload = { key: string; name: string; error?: string };

export function PhotoManager({ vendorId, photos }: { vendorId: string; photos: AdminPhoto[] }) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // The order shown, which drag and drop changes live; it resets whenever the server sends new photos.
  const serverOrder = photos.map((photo) => photo.id);
  const [order, setOrder] = useState(serverOrder);
  const [syncedOrder, setSyncedOrder] = useState(serverOrder.join());
  if (syncedOrder !== serverOrder.join()) {
    setSyncedOrder(serverOrder.join());
    setOrder(serverOrder);
  }
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  const ordered = order.flatMap((id) => photoById.get(id) ?? []);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState(false);

  function saveOrder(next: string[]) {
    setOrder(next);
    setOrderError(false);
    startTransition(async () => {
      try {
        await reorderPhotos(vendorId, next);
      } catch {
        setOrder(serverOrder);
        setOrderError(true);
      }
    });
  }

  function moveBy(id: string, delta: -1 | 1) {
    const next = [...order];
    const from = next.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= next.length) return;
    [next[from], next[to]] = [next[to]!, next[from]!];
    saveOrder(next);
  }

  // While a photo is dragged over another, it takes that one's place: before it or after it,
  // depending on which half the pointer is in.
  function dragOverPhoto(event: DragEvent<HTMLElement>, targetId: string) {
    if (!draggedId) return;
    event.preventDefault();
    if (targetId === draggedId) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const after = event.clientX > left + width / 2;
    const rest = order.filter((id) => id !== draggedId);
    rest.splice(rest.indexOf(targetId) + (after ? 1 : 0), 0, draggedId);
    if (rest.join() !== order.join()) setOrder(rest);
  }

  function endPhotoDrag() {
    setDraggedId(null);
    if (order.join() !== serverOrder.join()) saveOrder(order);
  }

  const updateUpload = (key: string, change: Partial<Upload> | null) =>
    setUploads((current) =>
      change === null
        ? current.filter((u) => u.key !== key)
        : current.map((u) => (u.key === key ? { ...u, ...change } : u)),
    );

  // One file at a time, so photos land in the order they were picked.
  async function uploadFiles(files: File[]) {
    const queued = files.map((file) => ({ file, key: crypto.randomUUID() }));
    setUploads((current) => [...current, ...queued.map(({ file, key }) => ({ key, name: file.name }))]);

    for (const { file, key } of queued) {
      try {
        const { blob, extension } = await preparePhoto(file);
        const ticket = await requestPhotoUpload(vendorId, extension);
        if ("error" in ticket) throw new Error(ticket.error);
        await uploadToSignedUrl(ticket.uploadUrl, blob);
        const saved = await addPhoto(vendorId, ticket.path);
        if (saved.error) throw new Error(saved.error);
        updateUpload(key, null);
      } catch (error) {
        updateUpload(key, { error: error instanceof Error ? error.message : "Не удалось загрузить." });
      }
    }
  }

  // Files dragged in from the computer, as opposed to a photo being moved within the grid.
  const isFileDrag = (event: DragEvent) => event.dataTransfer.types.includes("Files");

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!isFileDrag(event)) return;
    const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith("image/"));
    if (files.length > 0) void uploadFiles(files);
  }

  const run = (action: () => Promise<void>) => startTransition(action);
  const visibleCount = photos.filter((photo) => photo.isApproved).length;

  return (
    <section className="mb-12 flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">Фото</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {photos.length === 0
              ? "Фото пока нет. Первое загруженное станет обложкой."
              : `На сайте ${visibleCount} из ${photos.length}. Перетаскивайте фото, чтобы поменять порядок в галерее.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={buttonVariants({ variant: "outline" })}
        >
          <Upload className="h-4 w-4" />
          Загрузить фото
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
          multiple
          hidden
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = "";
            if (files.length > 0) void uploadFiles(files);
          }}
        />
      </div>

      {orderError && (
        <p role="alert" className="text-sm text-destructive">
          Не удалось сохранить порядок. Обновите страницу и попробуйте ещё раз.
        </p>
      )}

      <div
        onDragOver={(event) => {
          if (!isFileDrag(event)) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "grid grid-cols-2 gap-3 rounded-[20px] border border-dashed p-3 transition-colors sm:grid-cols-3 lg:grid-cols-4",
          dragging ? "border-foreground bg-muted/60" : "border-border",
        )}
      >
        {ordered.map((photo, index) => (
          <figure
            key={photo.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              // Firefox starts a drag only when some data is set.
              event.dataTransfer.setData("text/plain", photo.id);
              setDraggedId(photo.id);
            }}
            onDragOver={(event) => dragOverPhoto(event, photo.id)}
            onDrop={(event) => event.preventDefault()}
            onDragEnd={endPhotoDrag}
            className={cn(
              "group relative aspect-[4/5] cursor-grab overflow-hidden rounded-2xl bg-muted active:cursor-grabbing",
              !photo.isApproved && "opacity-45",
              draggedId === photo.id && "opacity-30 ring-2 ring-foreground",
            )}
          >
            <Image src={photo.url} alt="" fill sizes="220px" draggable={false} className="object-cover" />
            <div className="absolute top-2 left-2 flex gap-1">
              {photo.isCover && <Badge>Обложка</Badge>}
              {!photo.isApproved && <Badge>Скрыто</Badge>}
            </div>
            <figcaption className="absolute inset-x-2 bottom-2 flex justify-between gap-1 rounded-xl bg-background/90 p-1 opacity-100 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
              <div className="flex">
                <IconButton label="Левее" disabled={pending || index === 0} onClick={() => moveBy(photo.id, -1)}>
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  label="Правее"
                  disabled={pending || index === ordered.length - 1}
                  onClick={() => moveBy(photo.id, 1)}
                >
                  <ChevronRight />
                </IconButton>
              </div>
              <div className="flex">
                <IconButton
                  label="Сделать обложкой"
                  disabled={pending || photo.isCover}
                  onClick={() => run(() => setCoverPhoto(photo.id))}
                >
                  <Star />
                </IconButton>
                <IconButton
                  label={photo.isApproved ? "Скрыть с сайта" : "Показать на сайте"}
                  disabled={pending}
                  onClick={() => run(() => setPhotoVisible(photo.id, !photo.isApproved))}
                >
                  {photo.isApproved ? <EyeOff /> : <Eye />}
                </IconButton>
                <IconButton
                  label="Удалить"
                  disabled={pending}
                  onClick={() => {
                    if (confirm("Удалить фото насовсем?")) run(() => deletePhoto(photo.id));
                  }}
                >
                  <Trash2 />
                </IconButton>
              </div>
            </figcaption>
          </figure>
        ))}

        {uploads.map((upload) => (
          <div
            key={upload.key}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl bg-muted p-3 text-center text-xs"
          >
            <span className="w-full truncate text-foreground">{upload.name}</span>
            {upload.error ? (
              <>
                <span className="text-destructive">{upload.error}</span>
                <button
                  type="button"
                  onClick={() => updateUpload(upload.key, null)}
                  className="text-muted-foreground underline"
                >
                  Убрать
                </button>
              </>
            ) : (
              <span className="text-muted-foreground">Загружается…</span>
            )}
          </div>
        ))}

        {photos.length === 0 && uploads.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            Перетащите фото сюда или нажмите «Загрузить фото». До {MAX_PHOTOS} штук.
          </p>
        )}
      </div>
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-background/95 px-2 py-0.5 text-[10px] text-foreground">{children}</span>;
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-muted disabled:opacity-30 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}
