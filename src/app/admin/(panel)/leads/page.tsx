import type { Metadata } from "next";
import { LeadListScreen } from "@/features/admin/leads/LeadListScreen";
import { parsePeriod } from "@/features/admin/periods";

export const metadata: Metadata = { title: "Заявки" };

export default async function AdminLeadsPage(props: PageProps<"/admin/leads">) {
  const params = await props.searchParams;
  const text = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");
  const period = parsePeriod(params.period);
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);

  return <LeadListScreen filters={{ vendorId: text(params.vendor), period, page }} />;
}
