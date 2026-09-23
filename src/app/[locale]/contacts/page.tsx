import { staticPageMetadata } from "@/shared/config/seo";
import { ContactsScreen } from "@/features/landing/ContactsScreen";

export const generateMetadata = staticPageMetadata("ContactsPage", "/contacts");

export default function ContactsPage() {
  return <ContactsScreen />;
}
