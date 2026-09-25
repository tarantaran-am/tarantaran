import "server-only";
import { revalidatePath } from "next/cache";

// Vendors show up on the home page, in the catalog, in categories and in the sitemap:
// refreshing every public page is simpler than tracking each place, and the site is small.
export function refreshPublicPages() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
