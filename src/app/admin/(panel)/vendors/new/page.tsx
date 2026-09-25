import type { Metadata } from "next";
import { VendorCreateScreen } from "@/features/admin/vendors/VendorEditScreen";

export const metadata: Metadata = { title: "Новый подрядчик" };

export default function AdminNewVendorPage() {
  return <VendorCreateScreen />;
}
