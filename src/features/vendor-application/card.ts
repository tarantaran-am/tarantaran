import "server-only";
import type { Category, Prisma, Vendor, VendorApplication } from "@/generated/prisma/client";
import { SOCIAL_NETWORKS } from "@/shared/config/social";
import type { ApplicationValues } from "./schema";

// The application's fields map onto the card's Russian name and description: the admin adds the
// other languages. Only the visible photos are offered for editing; ones the admin hid stay as they are.
export const CARD_SELECT = {
  id: true,
  slug: true,
  nameRu: true,
  descriptionRu: true,
  category: true,
  extraCategories: true,
  marzes: true,
  phone: true,
  isPublished: true,
  ...(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, true])) as Record<
    (typeof SOCIAL_NETWORKS)[number],
    true
  >),
  photos: {
    where: { isApproved: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, blobUrl: true },
  },
} satisfies Prisma.VendorSelect;

export type Card = Prisma.VendorGetPayload<{ select: typeof CARD_SELECT }>;

const socials = (source: Pick<Vendor, (typeof SOCIAL_NETWORKS)[number]>) =>
  Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, source[network] ?? ""])) as Record<
    (typeof SOCIAL_NETWORKS)[number],
    string
  >;

// What the card shows now, as the form's values: the starting point for the vendor's edits.
export function cardValues(card: Card): ApplicationValues {
  return {
    name: card.nameRu,
    category: card.category,
    extraCategory: card.extraCategories[0] ?? "",
    description: card.descriptionRu,
    phone: card.phone ?? "",
    marzes: card.marzes,
    photos: card.photos.map((photo) => photo.blobUrl),
    ...socials(card),
  };
}

export function applicationValues(application: VendorApplication): ApplicationValues {
  return {
    name: application.name,
    category: application.category,
    extraCategory: application.extraCategory ?? "",
    description: application.description,
    phone: application.phone ?? "",
    marzes: application.marzes,
    photos: application.photoUrls,
    ...socials(application),
  };
}

// The form has room for one extra category; any further ones the admin added are kept after it.
export function mergeExtraCategories(card: Card, proposed: Category | null, category: Category): Category[] {
  const merged = [proposed, ...card.extraCategories.slice(1)].filter((value) => value !== null);
  return [...new Set(merged)].filter((value) => value !== category);
}
