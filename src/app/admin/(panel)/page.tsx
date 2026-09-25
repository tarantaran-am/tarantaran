import type { Metadata } from "next";
import { DashboardScreen } from "@/features/admin/DashboardScreen";

export const metadata: Metadata = { title: "Обзор" };

export default function AdminDashboardPage() {
  return <DashboardScreen />;
}
