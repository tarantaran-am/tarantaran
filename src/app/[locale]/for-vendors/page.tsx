import { staticPageMetadata } from "@/shared/config/seo";
import { ForVendorsScreen } from "@/features/for-vendors/ForVendorsScreen";

export const generateMetadata = staticPageMetadata("ForVendorsPage", "/for-vendors");

export default function ForVendorsPage() {
  return <ForVendorsScreen />;
}
