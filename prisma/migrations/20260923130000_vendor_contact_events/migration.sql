-- Generalise link clicks into contact events and add the "show contacts" press.
ALTER TYPE "SocialNetwork" RENAME TO "ContactEventKind";
ALTER TYPE "ContactEventKind" ADD VALUE 'reveal' BEFORE 'instagram';

ALTER TABLE "vendor_link_clicks" RENAME TO "vendor_contact_events";
ALTER TABLE "vendor_contact_events" RENAME COLUMN "network" TO "kind";

ALTER TABLE "vendor_contact_events" RENAME CONSTRAINT "vendor_link_clicks_pkey" TO "vendor_contact_events_pkey";
ALTER TABLE "vendor_contact_events" RENAME CONSTRAINT "vendor_link_clicks_vendor_id_fkey" TO "vendor_contact_events_vendor_id_fkey";
ALTER INDEX "vendor_link_clicks_vendor_id_day_idx" RENAME TO "vendor_contact_events_vendor_id_day_idx";
ALTER INDEX "vendor_link_clicks_vendor_id_network_day_visitor_hash_key" RENAME TO "vendor_contact_events_vendor_id_kind_day_visitor_hash_key";
