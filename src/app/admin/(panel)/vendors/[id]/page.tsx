import type { Metadata } from "next";
import { VendorEditScreen } from "@/features/admin/vendors/VendorEditScreen";

export const metadata: Metadata = { title: "Подрядчик" };

export default async function AdminVendorPage(props: PageProps<"/admin/vendors/[id]">) {
  const { id } = await props.params;
  return <VendorEditScreen vendorId={id} />;
}
