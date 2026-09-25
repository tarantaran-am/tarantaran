import { z } from "zod";
import { CATEGORIES } from "@/shared/config/category";
import { MARZES } from "@/shared/config/marz";
import { SOCIAL_NETWORKS } from "@/shared/config/social";

// The vendor form's fields, as the server action reads them from FormData.
export const VENDOR_TEXT_FIELDS = [
  "slug",
  "nameRu",
  "nameHy",
  "nameEn",
  "descriptionRu",
  "descriptionHy",
  "descriptionEn",
  "category",
  "phone",
  "address",
  ...SOCIAL_NETWORKS,
] as const;

export type VendorFormValues = Record<(typeof VENDOR_TEXT_FIELDS)[number], string> & {
  marzes: string[];
  isPublished: boolean;
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

// Handles and full links are both fine: the site turns handles into links (see socialUrl).
const socialLink = optionalText(300).refine((value) => value === null || !/\s/.test(value));

export const vendorSchema = z.object({
  // Existing slugs mix case and underscores (REC_agency, dj_goodmen), so those stay allowed.
  slug: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,59}$/),
  nameRu: z.string().trim().min(1).max(120),
  nameHy: optionalText(120),
  nameEn: optionalText(120),
  descriptionRu: z.string().trim().min(1).max(5000),
  descriptionHy: optionalText(5000),
  descriptionEn: optionalText(5000),
  category: z.enum(CATEGORIES),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => /^\+?[\d\s()-]+$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 8),
  address: optionalText(300),
  marzes: z.array(z.enum(MARZES)).min(1),
  ...(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, socialLink])) as Record<
    (typeof SOCIAL_NETWORKS)[number],
    typeof socialLink
  >),
  isPublished: z.boolean(),
});

export type VendorField = keyof VendorFormValues;

export const VENDOR_FIELD_ERRORS: Partial<Record<VendorField, string>> = {
  slug: "Латиница, цифры, «-» или «_», от 2 до 60 символов.",
  nameRu: "Укажите название на русском.",
  descriptionRu: "Добавьте описание на русском.",
  category: "Выберите категорию.",
  phone: "Телефон с кодом страны, например +374 91 23 45 67.",
  marzes: "Отметьте хотя бы один марз.",
};
