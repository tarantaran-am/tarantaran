import { Suspense, type ReactNode } from "react";
import { RubricNav, RubricSidebar } from "@/features/blog/RubricSidebar";
import { SidebarLayout } from "@/shared/components/SidebarLayout";

export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      sidebar={
        <Suspense fallback={<RubricNav />}>
          <RubricSidebar />
        </Suspense>
      }
    >
      {children}
    </SidebarLayout>
  );
}
