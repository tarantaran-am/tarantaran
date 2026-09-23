import { staticPageMetadata } from "@/shared/config/seo";
import { FaqScreen } from "@/features/landing/FaqScreen";

export const generateMetadata = staticPageMetadata("FaqPage", "/faq");

export default function FaqPage() {
  return <FaqScreen />;
}
