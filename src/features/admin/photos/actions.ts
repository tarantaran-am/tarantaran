"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/db";
import { requireAdmin } from "@/features/admin/auth/dal";
import { refreshPublicPages } from "@/features/admin/revalidate";
import { MAX_PHOTOS, type PhotoExtension } from "./limits";
import { z } from "zod";
import { createSignedUploadUrl, objectExists, pathFromPublicUrl, publicUrl, removeObjects } from "./storage";

// Uploading is two steps: the browser asks for a signed URL, uploads straight to Storage,
// then reports the file back so it gets a row. Files are named by vendor id and a random id,
// never reused, so a new photo can't be hidden behind a year-long CDN cache of an old one.
const isUuid = (value: string) => z.uuid().safeParse(value).success;

export async function requestPhotoUpload(
  vendorId: string,
  extension: PhotoExtension,
): Promise<{ path: string; uploadUrl: string } | { error: string }> {
  await requireAdmin();
  if (!isUuid(vendorId)) return { error: "Подрядчик не найден." };
  if (extension !== "webp" && extension !== "jpg") return { error: "Неподдерживаемый формат." };

  const count = await prisma.photo.count({ where: { vendorId } });
  if (count >= MAX_PHOTOS) return { error: `У подрядчика уже ${MAX_PHOTOS} фото — это максимум.` };
  if (!(await prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true } }))) {
    return { error: "Подрядчик не найден." };
  }

  const path = `${vendorId}/${randomUUID()}.${extension}`;
  return { path, uploadUrl: await createSignedUploadUrl(path) };
}

export async function addPhoto(vendorId: string, path: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!isUuid(vendorId)) return { error: "Подрядчик не найден." };
  const expected = new RegExp(`^${vendorId}/[0-9a-f-]{36}\\.(webp|jpg)$`);
  if (!expected.test(path) || !(await objectExists(path))) return { error: "Файл не загрузился, попробуйте ещё раз." };

  const photos = await prisma.photo.findMany({ where: { vendorId }, select: { sortOrder: true } });
  await prisma.photo.create({
    data: {
      vendorId,
      blobUrl: publicUrl(path),
      isApproved: true,
      isCover: photos.length === 0,
      sortOrder: Math.max(-1, ...photos.map((photo) => photo.sortOrder)) + 1,
    },
  });
  refresh(vendorId);
  return {};
}

export async function setCoverPhoto(photoId: string): Promise<void> {
  const photo = await findPhoto(photoId);
  await prisma.$transaction([
    prisma.photo.updateMany({ where: { vendorId: photo.vendorId }, data: { isCover: false } }),
    prisma.photo.update({ where: { id: photoId }, data: { isCover: true } }),
  ]);
  refresh(photo.vendorId);
}

export async function setPhotoVisible(photoId: string, visible: boolean): Promise<void> {
  const photo = await findPhoto(photoId);
  await prisma.photo.update({ where: { id: photoId }, data: { isApproved: visible } });
  refresh(photo.vendorId);
}

// Saves the order the admin arranged, by drag and drop or the arrow buttons. The list must be
// exactly the vendor's photos, so a stale page can't drop or duplicate one.
export async function reorderPhotos(vendorId: string, photoIds: string[]): Promise<void> {
  await requireAdmin();
  const current = await prisma.photo.findMany({ where: { vendorId }, select: { id: true } });
  const known = new Set(current.map(({ id }) => id));
  if (
    photoIds.length !== known.size ||
    new Set(photoIds).size !== known.size ||
    !photoIds.every((id) => known.has(id))
  ) {
    throw new Error("The photo list changed; reload the page and try again.");
  }

  await prisma.$transaction(
    photoIds.map((id, index) => prisma.photo.update({ where: { id }, data: { sortOrder: index } })),
  );
  refresh(vendorId);
}

export async function deletePhoto(photoId: string): Promise<void> {
  const photo = await findPhoto(photoId);
  await prisma.photo.delete({ where: { id: photoId } });

  if (photo.isCover) {
    const next = await prisma.photo.findFirst({ where: { vendorId: photo.vendorId }, orderBy: { sortOrder: "asc" } });
    if (next) await prisma.photo.update({ where: { id: next.id }, data: { isCover: true } });
  }

  // The row is gone either way; a file left behind in Storage is harmless, so a failure here isn't fatal.
  const path = pathFromPublicUrl(photo.blobUrl);
  if (path) await removeObjects([path]).catch(() => {});
  refresh(photo.vendorId);
}

async function findPhoto(photoId: string) {
  await requireAdmin();
  return prisma.photo.findUniqueOrThrow({ where: { id: photoId } });
}

function refresh(vendorId: string) {
  revalidatePath(`/admin/vendors/${vendorId}`);
  refreshPublicPages();
}
