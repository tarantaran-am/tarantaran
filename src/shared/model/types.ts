import type { MarzSlug } from "@/shared/config/marz";
import type { CategorySlug } from "@/shared/config/category";
import type { SocialNetwork } from "@/shared/config/social";

export type Locale = "hy" | "ru" | "en";

export interface Vendor {
  id: string;
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  marzes: MarzSlug[];
  address: string;
  description: string;
  phone: string;
  socials: Partial<Record<SocialNetwork, string>>;
  cover: string;
  photos: string[];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  namePlural: string;
  description: string;
  cover: string;
}
