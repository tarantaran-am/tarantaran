import type { ReactNode } from "react";
import { CategorySidebar } from "@/features/catalog/CategorySidebar";
import { getCategories } from "@/shared/lib/categories";
import { Container } from "@/shared/components/container";

export async function CatalogShell({ children }: { children: ReactNode }) {
  const categories = await getCategories();

  return (
    <div className="pt-16 md:pt-[68px]">
      <Container className="py-10 md:py-14">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[210px_1fr] lg:gap-14">
          <CategorySidebar categories={categories} />
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  );
}
