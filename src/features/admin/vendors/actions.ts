"use server";

import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/db";
import { requireAdmin } from "@/features/admin/auth/dal";
import { refreshPublicPages } from "@/features/admin/revalidate";
import { VENDOR_TEXT_FIELDS, vendorSchema, type VendorField, type VendorFormValues } from "./schema";

export type VendorFormState =
  | { status: "idle" }
  | { status: "saved"; values: VendorFormValues }
  // The values come back so the form can be refilled after React resets it.
  | { status: "invalid"; values: VendorFormValues; invalid: VendorField[]; slugTaken?: boolean }
  | { status: "error"; values: VendorFormValues };

function readForm(formData: FormData): VendorFormValues {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    ...(Object.fromEntries(VENDOR_TEXT_FIELDS.map((field) => [field, text(field)])) as Record<
      (typeof VENDOR_TEXT_FIELDS)[number],
      string
    >),
    marzes: formData.getAll("marzes").filter((value): value is string => typeof value === "string"),
    isPublished: formData.get("isPublished") === "on",
  };
}

// Creates a vendor when `vendorId` is null, otherwise updates it.
export async function saveVendor(
  vendorId: string | null,
  _previous: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  await requireAdmin();

  const values = readForm(formData);
  const parsed = vendorSchema.safeParse(values);
  if (!parsed.success) {
    const invalid = [...new Set(parsed.error.issues.map((issue) => issue.path[0] as VendorField))];
    return { status: "invalid", values, invalid };
  }

  let id = vendorId;
  try {
    if (id) {
      await prisma.vendor.update({ where: { id }, data: parsed.data });
    } else {
      id = (await prisma.vendor.create({ data: parsed.data, select: { id: true } })).id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "invalid", values, invalid: ["slug"], slugTaken: true };
    }
    Sentry.captureException(error);
    return { status: "error", values };
  }

  refreshPublicPages();
  if (!vendorId) redirect(`/admin/vendors/${id}`);
  return { status: "saved", values };
}
