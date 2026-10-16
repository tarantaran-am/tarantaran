import type { Metadata } from "next";
import { ApplicationListScreen } from "@/features/admin/applications/ApplicationListScreen";

export const metadata: Metadata = { title: "Анкеты подрядчиков" };

export default function AdminApplicationsPage() {
  return <ApplicationListScreen />;
}
