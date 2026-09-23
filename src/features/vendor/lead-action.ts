"use server";

import { createHash } from "node:crypto";
import { after } from "next/server";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { env } from "@/env";
import { routing } from "@/i18n/routing";
import { prisma } from "@/shared/lib/db";
import { clientIp } from "@/shared/lib/client-ip";
import { notifyNewLead } from "@/features/vendor/lead-notification";

export type LeadField = "name" | "phone" | "eventDate" | "message";

export type LeadValues = {
  name: string;
  phone: string;
  eventDate: string;
  message: string;
  whatsapp: boolean;
  telegram: boolean;
};

export type LeadFormState =
  | { status: "idle" | "success" }
  // React resets the form after an action, so the values come back to refill it.
  | { status: "invalid" | "limited" | "error"; values: LeadValues; invalid: LeadField[] };

const RATE_LIMIT = { max: 20, windowMs: 60 * 60 * 1000 };

const PHONE = /^\+?[\d\s()-]+$/;

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(PHONE)
    .refine((value) => (value.match(/\d/g)?.length ?? 0) >= 8),
  eventDate: z.union([z.literal(""), z.iso.date()]),
  message: z.string().trim().max(2000),
});

const contextSchema = z.object({ vendorId: z.uuid(), locale: z.enum(routing.locales) });

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitLead(
  vendorId: string,
  locale: string,
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const values: LeadValues = {
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    eventDate: text(formData, "eventDate"),
    message: text(formData, "message"),
    whatsapp: formData.get("whatsapp") === "on",
    telegram: formData.get("telegram") === "on",
  };

  // Honeypot: people never see this field, form-filling bots do. Pretend it worked.
  if (text(formData, "company")) return { status: "success" };

  const context = contextSchema.safeParse({ vendorId, locale });
  const parsed = leadSchema.safeParse(values);
  if (!context.success) return { status: "error", values, invalid: [] };
  if (!parsed.success) {
    const invalid = [...new Set(parsed.error.issues.map((issue) => issue.path[0] as LeadField))];
    return { status: "invalid", values, invalid };
  }

  const { name, phone, eventDate, message } = parsed.data;
  const visitorHash = createHash("sha256")
    .update(`${env.VISITOR_HASH_SALT}|${clientIp(await headers())}`)
    .digest("hex");

  try {
    const recent = await prisma.vendorLead.count({
      where: { visitorHash, createdAt: { gte: new Date(Date.now() - RATE_LIMIT.windowMs) } },
    });
    if (recent >= RATE_LIMIT.max) return { status: "limited", values, invalid: [] };

    const vendor = await prisma.vendor.findFirst({
      where: { id: context.data.vendorId, isPublished: true },
      select: { id: true, slug: true, category: true, nameRu: true, phone: true, whatsapp: true, telegram: true },
    });
    if (!vendor) return { status: "error", values, invalid: [] };

    await prisma.vendorLead.create({
      data: {
        vendorId: vendor.id,
        name,
        phone,
        eventDate: eventDate ? new Date(eventDate) : null,
        message: message || null,
        contactWhatsapp: values.whatsapp,
        contactTelegram: values.telegram,
        locale: context.data.locale,
        visitorHash,
      },
    });

    // The lead is saved; a Telegram outage must not turn it into an error for the visitor.
    after(() =>
      notifyNewLead({
        vendor,
        lead: { ...values, name, phone, eventDate, message, locale: context.data.locale },
      }).catch((error) => Sentry.captureException(error)),
    );
  } catch (error) {
    Sentry.captureException(error);
    return { status: "error", values, invalid: [] };
  }

  return { status: "success" };
}
