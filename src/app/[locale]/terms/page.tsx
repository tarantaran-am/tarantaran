import { staticPageMetadata } from "@/shared/config/seo";
import { LegalScreen } from "@/features/legal/LegalScreen";

export const generateMetadata = staticPageMetadata("TermsPage", "/terms", { title: "title" });

export default function TermsPage() {
  return <LegalScreen doc="terms" />;
}
