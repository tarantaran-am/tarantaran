import { z } from "@/shared/lib/zod";
import { CATEGORIES } from "@/shared/config/category";
import { MARZES } from "@/shared/config/marz";
import { SOCIAL_NETWORKS } from "@/shared/config/social";

export const NAME_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 3000;
export const MIN_PHOTOS = 4;
export const MAX_PHOTOS = 10;

// The application form's text fields, as the server action reads them from FormData.
export const APPLICATION_TEXT_FIELDS = [
  "name",
  "category",
  "extraCategory",
  "description",
  "phone",
  ...SOCIAL_NETWORKS,
] as const;

// `photos` are the public URLs of the uploaded files, in the vendor's order.
export type ApplicationValues = Record<(typeof APPLICATION_TEXT_FIELDS)[number], string> & {
  marzes: string[];
  photos: string[];
};

// "contact" is the form-level check that there is a phone or a link.
export type ApplicationField = keyof ApplicationValues | "contact";

export const EMPTY_APPLICATION: ApplicationValues = {
  ...(Object.fromEntries(APPLICATION_TEXT_FIELDS.map((field) => [field, ""])) as Record<
    (typeof APPLICATION_TEXT_FIELDS)[number],
    string
  >),
  marzes: [],
  photos: [],
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

// Handles and full links are both fine, like in the admin's vendor form.
const socialLink = optionalText(300).refine((value) => value === null || !/\s/.test(value));

export const applicationSchema = z
  .object({
    name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
    category: z.enum(CATEGORIES),
    extraCategory: z.union([z.literal("").transform(() => null), z.enum(CATEGORIES)]),
    marzes: z.array(z.enum(MARZES)).min(1),
    // The upper limit is checked in the action: a card the admin filled may already have more.
    photos: z.array(z.string()).min(MIN_PHOTOS),
    description: z.string().trim().min(1).max(DESCRIPTION_MAX_LENGTH),
    phone: optionalText(30).refine(
      (value) => value === null || (/^\+?[\d\s()-]+$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 8),
    ),
    ...(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, socialLink])) as Record<
      (typeof SOCIAL_NETWORKS)[number],
      typeof socialLink
    >),
  })
  .refine((data) => data.extraCategory !== data.category, { path: ["extraCategory"] })
  // Couples need some way to reach the vendor: a phone or at least one link.
  .refine((data) => data.phone !== null || SOCIAL_NETWORKS.some((network) => data[network] !== null), {
    path: ["contact"],
  });
