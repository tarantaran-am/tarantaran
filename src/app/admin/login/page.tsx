import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin, isAdminConfigured } from "@/features/admin/auth/dal";
import { LoginForm } from "@/features/admin/auth/LoginForm";

export const metadata: Metadata = { title: "Вход" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm configured={isAdminConfigured()} />;
}
