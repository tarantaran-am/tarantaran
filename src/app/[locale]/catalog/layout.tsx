import { CatalogShell } from "@/features/catalog/CatalogShell";

export default function CatalogLayout({ children }: LayoutProps<"/[locale]/catalog">) {
  return <CatalogShell>{children}</CatalogShell>;
}
