"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { Prisma, type VendorApplication } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/db";
import { z } from "@/shared/lib/zod";
import { requireAdmin } from "@/features/admin/auth/dal";
import { refreshPublicPages } from "@/features/admin/revalidate";
import { vendorSchema } from "@/features/admin/vendors/schema";
import { CARD_SELECT, mergeExtraCategories } from "@/features/vendor-application/card";
import { SOCIAL_NETWORKS } from "@/shared/config/social";
import { bucketStorage } from "@/shared/lib/storage";
import { ADMIN_MESSAGE_MAX_LENGTH } from "./limits";

export type ReviewFormState =
  | { status: "idle" | "saved" }
  // The values come back so the form can be refilled after React resets it.
  | { status: "invalid" | "error"; slug: string; message: string; slugTaken?: boolean };

const messageSchema = z.string().trim().max(ADMIN_MESSAGE_MAX_LENGTH);

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// The vendor sees the answer on their account page.
function refreshPages(id: string) {
  revalidatePath("/[locale]/account", "page");
  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/applications/${id}`);
}

const { pathFromPublicUrl, removeObjects } = bucketStorage("vendors");

// A first application becomes a hidden vendor card, which then opens so the admin can check and publish it.
// Proposed changes to an existing card are applied to it; the card's address stays as it was.
export async function approveApplication(
  id: string,
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  await requireAdmin();
  const values = { slug: text(formData, "slug"), message: text(formData, "message") };
  const message = messageSchema.safeParse(values.message);
  if (!message.success) return { status: "invalid", ...values };

  const adminMessage = message.data || null;
  let result: { vendorId: string; removedFiles: string[] };
  try {
    const application = await prisma.vendorApplication.findUnique({ where: { id }, select: { vendorId: true } });
    if (application?.vendorId) {
      result = await applyChanges(id, application.vendorId, adminMessage);
    } else {
      const slug = vendorSchema.shape.slug.safeParse(values.slug);
      if (!slug.success) return { status: "invalid", ...values };
      result = { vendorId: await createCard(id, slug.data, adminMessage), removedFiles: [] };
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "invalid", ...values, slugTaken: true };
    }
    Sentry.captureException(error);
    return { status: "error", ...values };
  }

  // The rows are gone either way; files left behind in Storage are harmless, so a failure here isn't fatal.
  const paths = result.removedFiles.map(pathFromPublicUrl).filter((path) => path !== null);
  await removeObjects(paths).catch((error) => Sentry.captureException(error));

  refreshPages(id);
  refreshPublicPages();
  redirect(`/admin/vendors/${result.vendorId}`);
}

async function openApplication(tx: Prisma.TransactionClient, id: string) {
  const application = await tx.vendorApplication.findUnique({ where: { id } });
  if (!application || application.status === "approved") throw new Error("Application is not open for review");
  return application;
}

function markApproved(tx: Prisma.TransactionClient, id: string, vendorId: string, adminMessage: string | null) {
  return tx.vendorApplication.update({
    where: { id },
    data: { status: "approved", vendorId, adminMessage, reviewedAt: new Date() },
  });
}

function cardFields(application: VendorApplication) {
  return {
    nameRu: application.name,
    descriptionRu: application.description,
    category: application.category,
    marzes: application.marzes,
    phone: application.phone,
    ...(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, application[network]])) as Record<
      (typeof SOCIAL_NETWORKS)[number],
      string | null
    >),
  };
}

function createCard(id: string, slug: string, adminMessage: string | null): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const application = await openApplication(tx, id);
    const vendor = await tx.vendor.create({
      data: {
        ...cardFields(application),
        slug,
        extraCategories: application.extraCategory ? [application.extraCategory] : [],
        isPublished: false,
        photos: {
          create: application.photoUrls.map((blobUrl, index) => ({
            blobUrl,
            isApproved: true,
            isCover: index === 0,
            sortOrder: index,
          })),
        },
      },
      select: { id: true },
    });
    await markApproved(tx, id, vendor.id, adminMessage);
    return vendor.id;
  });
}

// The proposed photos replace the visible ones, in the proposed order with the first as the cover.
// Photos the admin hid were never offered to the vendor, so they stay, hidden, after the others.
function applyChanges(
  id: string,
  vendorId: string,
  adminMessage: string | null,
): Promise<{ vendorId: string; removedFiles: string[] }> {
  return prisma.$transaction(async (tx) => {
    const application = await openApplication(tx, id);
    const card = await tx.vendor.findUniqueOrThrow({ where: { id: vendorId }, select: CARD_SELECT });
    const all = await tx.photo.findMany({ where: { vendorId }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
    const proposed = application.photoUrls;
    const dropped = all.filter((photo) => photo.isApproved && !proposed.includes(photo.blobUrl));
    const hidden = all.filter((photo) => !photo.isApproved && !proposed.includes(photo.blobUrl));

    await tx.vendor.update({
      where: { id: vendorId },
      data: {
        ...cardFields(application),
        extraCategories: mergeExtraCategories(card, application.extraCategory, application.category),
      },
    });
    await tx.photo.deleteMany({ where: { id: { in: dropped.map((photo) => photo.id) } } });
    for (const [index, blobUrl] of proposed.entries()) {
      const existing = all.find((photo) => photo.blobUrl === blobUrl);
      const data = { isApproved: true, isCover: index === 0, sortOrder: index };
      if (existing) await tx.photo.update({ where: { id: existing.id }, data });
      else await tx.photo.create({ data: { ...data, vendorId, blobUrl } });
    }
    for (const [index, photo] of hidden.entries()) {
      await tx.photo.update({ where: { id: photo.id }, data: { isCover: false, sortOrder: proposed.length + index } });
    }
    await markApproved(tx, id, vendorId, adminMessage);
    return { vendorId, removedFiles: dropped.map((photo) => photo.blobUrl) };
  });
}

// Sends the application back with a message; the vendor fixes it and sends it again.
export async function rejectApplication(
  id: string,
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  await requireAdmin();
  const values = { slug: "", message: text(formData, "message") };
  const message = messageSchema.min(1).safeParse(values.message);
  if (!message.success) return { status: "invalid", ...values };

  const { count } = await prisma.vendorApplication.updateMany({
    where: { id, status: { not: "approved" } },
    data: { status: "rejected", adminMessage: message.data, reviewedAt: new Date() },
  });
  if (count === 0) return { status: "error", ...values };

  refreshPages(id);
  return { status: "saved" };
}
