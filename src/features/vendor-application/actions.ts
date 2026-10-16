"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { requireAccount } from "@/features/auth/dal";
import type { Account } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/db";
import { isPhotoExtension, type PhotoExtension } from "@/shared/lib/photo/limits";
import { bucketStorage } from "@/shared/lib/storage";
import {
  APPLICATION_TEXT_FIELDS,
  MAX_PHOTOS,
  applicationSchema,
  type ApplicationField,
  type ApplicationValues,
} from "./schema";

// The photos land in the vendors' bucket, so on approval the card uses the same files.
const storage = bucketStorage("vendors");

export type ApplicationFormState =
  | { status: "idle" | "sent" }
  // The values come back so the form can be refilled after React resets it.
  | { status: "invalid"; values: ApplicationValues; invalid: ApplicationField[] }
  | { status: "error"; values: ApplicationValues };

async function requireVendor(): Promise<Account | null> {
  const account = await requireAccount();
  return account.role === "vendor" ? account : null;
}

const photoFolder = (accountId: string) => `applications/${accountId}`;

// Photos go straight from the browser to Storage by a signed URL; the form then sends their URLs.
// Each file has a fresh name, so a replaced photo can't hide behind a CDN cache of the old one.
export async function requestApplicationPhotoUpload(
  extension: PhotoExtension,
): Promise<{ uploadUrl: string; url: string } | { error: "format" | "forbidden" }> {
  const account = await requireVendor();
  if (!account) return { error: "forbidden" };
  if (!isPhotoExtension(extension)) return { error: "format" };
  const path = `${photoFolder(account.id)}/${randomUUID()}.${extension}`;
  return { uploadUrl: await storage.createSignedUploadUrl(path), url: storage.publicUrl(path) };
}

function readForm(formData: FormData): ApplicationValues {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const list = (key: string) => formData.getAll(key).filter((value): value is string => typeof value === "string");
  return {
    ...(Object.fromEntries(APPLICATION_TEXT_FIELDS.map((field) => [field, text(field)])) as Record<
      (typeof APPLICATION_TEXT_FIELDS)[number],
      string
    >),
    marzes: list("marzes"),
    photos: list("photos"),
  };
}

// Photos already on the card or in the application are fine; a new one must be the account's own
// upload and really be in Storage. Up to MAX_PHOTOS, or more if the admin already put more on the card.
async function validPhotos(accountId: string, urls: string[], known: Set<string>, onCard: Set<string>) {
  const expected = new RegExp(`^${photoFolder(accountId)}/[0-9a-f-]{36}\\.(webp|jpg)$`);
  if (new Set(urls).size !== urls.length) return false;
  if (urls.length > Math.max(MAX_PHOTOS, urls.filter((url) => onCard.has(url)).length)) return false;
  const checks = urls.map((url) => {
    if (known.has(url)) return true;
    const path = storage.pathFromPublicUrl(url);
    return path !== null && expected.test(path) && storage.objectExists(path);
  });
  return (await Promise.all(checks)).every(Boolean);
}

// Sends the vendor's application, or an edited one while it waits or after it was rejected: either way it
// goes back to the admin as pending, and the old message is cleared. Once there is a card, the same row
// carries the vendor's proposed changes to it: the card stays as it is until the admin applies them.
export async function submitApplication(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const values = readForm(formData);
  const account = await requireVendor();
  if (!account) return { status: "error", values };

  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) {
    const invalid = [...new Set(parsed.error.issues.map((issue) => issue.path[0] as ApplicationField))];
    return { status: "invalid", values, invalid };
  }

  const { photos, ...fields } = parsed.data;
  let removed: string[] = [];
  try {
    const existing = await prisma.vendorApplication.findUnique({
      where: { accountId: account.id },
      // All of the card's photos, hidden ones too: their files must never be removed from here.
      select: { photoUrls: true, vendor: { select: { photos: { select: { blobUrl: true } } } } },
    });
    const onCard = new Set(existing?.vendor?.photos.map((photo) => photo.blobUrl));
    const known = new Set([...(existing?.photoUrls ?? []), ...onCard]);
    if (!(await validPhotos(account.id, photos, known, onCard))) {
      return { status: "invalid", values, invalid: ["photos"] };
    }

    const data = { ...fields, photoUrls: photos, status: "pending" as const, adminMessage: null, reviewedAt: null };
    await prisma.vendorApplication.upsert({
      where: { accountId: account.id },
      create: { ...data, accountId: account.id },
      update: data,
    });
    // Files the card still uses stay, whatever the proposal says.
    removed = (existing?.photoUrls ?? []).filter((url) => !photos.includes(url) && !onCard.has(url));
  } catch (error) {
    Sentry.captureException(error);
    return { status: "error", values };
  }

  // Files left behind in Storage are harmless, so a failure here isn't fatal.
  const paths = removed.map((url) => storage.pathFromPublicUrl(url)).filter((path) => path !== null);
  await storage.removeObjects(paths).catch((error) => Sentry.captureException(error));

  revalidatePath("/[locale]/account", "page");
  revalidatePath("/admin", "layout");
  return { status: "sent" };
}
