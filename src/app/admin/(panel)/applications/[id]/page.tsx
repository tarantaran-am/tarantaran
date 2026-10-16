import type { Metadata } from "next";
import { ApplicationReviewScreen } from "@/features/admin/applications/ApplicationReviewScreen";

export const metadata: Metadata = { title: "Анкета подрядчика" };

export default async function AdminApplicationPage(props: PageProps<"/admin/applications/[id]">) {
  const { id } = await props.params;
  return <ApplicationReviewScreen id={id} />;
}
