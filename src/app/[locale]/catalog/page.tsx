import { staticPageMetadata } from "@/shared/config/seo";
import { CatalogScreen } from "@/features/catalog/CatalogScreen";

export const generateMetadata = staticPageMetadata("CatalogPage", "/catalog");

export default async function CatalogPage(props: PageProps<"/[locale]/catalog">) {
  return <CatalogScreen searchParams={await props.searchParams} />;
}
