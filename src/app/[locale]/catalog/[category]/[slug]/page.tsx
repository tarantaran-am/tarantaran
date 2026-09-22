import { routing } from "@/i18n/routing";
import { getVendorPaths } from "@/shared/lib/queries";
import { getVendorMetadata } from "@/features/vendor/metadata";
import { VendorScreen } from "@/features/vendor/VendorScreen";

export async function generateStaticParams() {
  const paths = await getVendorPaths();
  return routing.locales.flatMap((locale) => paths.map((p) => ({ locale, category: p.category, slug: p.slug })));
}

export async function generateMetadata(props: PageProps<"/[locale]/catalog/[category]/[slug]">) {
  const { category, slug } = await props.params;
  return getVendorMetadata(category, slug);
}

export default async function VendorPage(props: PageProps<"/[locale]/catalog/[category]/[slug]">) {
  const { category, slug } = await props.params;
  return <VendorScreen categorySlug={category} slug={slug} />;
}
