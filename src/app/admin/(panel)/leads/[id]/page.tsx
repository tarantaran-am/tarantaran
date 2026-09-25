import type { Metadata } from "next";
import { LeadDetailScreen } from "@/features/admin/leads/LeadDetailScreen";

export const metadata: Metadata = { title: "Заявка" };

export default async function AdminLeadPage(props: PageProps<"/admin/leads/[id]">) {
  const { id } = await props.params;
  return <LeadDetailScreen leadId={id} />;
}
