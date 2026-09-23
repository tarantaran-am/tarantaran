import { staticPageMetadata } from "@/shared/config/seo";
import { LegalScreen } from "@/features/legal/LegalScreen";

export const generateMetadata = staticPageMetadata("PrivacyPage", "/privacy", { title: "title" });

export default function PrivacyPage() {
  return <LegalScreen doc="privacy" />;
}
