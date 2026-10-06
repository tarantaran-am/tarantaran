import type { StaticImageData } from "next/image";
import armenianWeddingTraditions from "@/assets/blog/armenian-wedding-traditions.jpg";
import choosingADate from "@/assets/blog/choosing-a-date.jpg";
import choosingAPhotographer from "@/assets/blog/choosing-a-photographer.jpg";
import choosingAVenue from "@/assets/blog/choosing-a-venue.jpg";
import churchCeremony from "@/assets/blog/church-ceremony.jpg";
import decorAndFlowers from "@/assets/blog/decor-and-flowers.jpg";
import hostAndTamada from "@/assets/blog/host-and-tamada.jpg";
import howManyGuests from "@/assets/blog/how-many-guests.jpg";
import weddingBudget from "@/assets/blog/wedding-budget.jpg";
import weddingDayTimeline from "@/assets/blog/wedding-day-timeline.jpg";
import weddingDress from "@/assets/blog/wedding-dress.jpg";

// Covers by post slug. Imported rather than kept in public/ so each is served from /_next/static/media
// under a content-hashed name as immutable, and browsers keep it across deploys.
export const BLOG_COVERS: Record<string, StaticImageData> = {
  "armenian-wedding-traditions": armenianWeddingTraditions,
  "choosing-a-date": choosingADate,
  "choosing-a-photographer": choosingAPhotographer,
  "choosing-a-venue": choosingAVenue,
  "church-ceremony": churchCeremony,
  "decor-and-flowers": decorAndFlowers,
  "host-and-tamada": hostAndTamada,
  "how-many-guests": howManyGuests,
  "wedding-budget": weddingBudget,
  "wedding-day-timeline": weddingDayTimeline,
  "wedding-dress": weddingDress,
};
