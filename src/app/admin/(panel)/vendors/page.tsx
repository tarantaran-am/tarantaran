import type { Metadata } from "next";
import { VendorListScreen } from "@/features/admin/vendors/VendorListScreen";
import type { VendorStatusFilter } from "@/features/admin/vendors/queries";

export const metadata: Metadata = { title: "Подрядчики" };

const STATUSES: VendorStatusFilter[] = ["all", "published", "hidden"];

export default async function AdminVendorsPage(props: PageProps<"/admin/vendors">) {
  const params = await props.searchParams;
  const text = (value: string | string[] | undefined) => (typeof value === "string" ? value.trim() : "");
  const status = STATUSES.find((value) => value === params.status) ?? "all";

  return <VendorListScreen filters={{ query: text(params.q), category: text(params.category), status }} />;
}
