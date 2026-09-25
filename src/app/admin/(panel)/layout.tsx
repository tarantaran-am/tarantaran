import { AdminShell } from "@/features/admin/AdminShell";

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
