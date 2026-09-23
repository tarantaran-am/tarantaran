import { staticPageMetadata } from "@/shared/config/seo";
import { AboutScreen } from "@/features/landing/AboutScreen";

export const generateMetadata = staticPageMetadata("AboutPage", "/about");

export default function AboutPage() {
  return <AboutScreen />;
}
