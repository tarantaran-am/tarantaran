import type { ReactNode } from "react";
import { CategorySidebar } from "@/features/catalog/CategorySidebar";
import { getCategories } from "@/shared/lib/categories";
import { SidebarLayout } from "@/shared/components/SidebarLayout";

export async function CatalogShell({ children }: { children: ReactNode }) {
  const categories = await getCategories();

  return <SidebarLayout sidebar={<CategorySidebar categories={categories} />}>{children}</SidebarLayout>;
}
