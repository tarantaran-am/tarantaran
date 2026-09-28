import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getRequestLocale } from "@/i18n/locale";
import { getVendor } from "@/shared/lib/queries";
import { isCategory } from "@/shared/config/category";
import { MARZES } from "@/shared/config/marz";
import { localizedAlternates, localizedOpenGraph } from "@/shared/config/seo";
import type { Vendor } from "@/shared/model/types";

// Descriptions shorter than this ("Music is life") get what the vendor does and where put in front of them.
const MIN_DESCRIPTION = 80;

type HeadlineValues = { name: string; role: string; where: string };

async function headlineValues(vendor: Vendor): Promise<HeadlineValues> {
  const [tCategory, tWhere] = await Promise.all([getTranslations("Category"), getTranslations("MarzIn")]);
  const [firstMarz] = vendor.marzes;
  const where = !firstMarz
    ? tWhere("armenia")
    : vendor.marzes.length >= MARZES.length
      ? tWhere("all")
      : tWhere(firstMarz);
  return { name: vendor.name, role: tCategory(`${vendor.categorySlug}.vendorRole`), where };
}

// "Zohrabyan Photography, wedding photographer in Yerevan": the title, and the alt text of the vendor's photos.
export async function getVendorHeadline(vendor: Vendor): Promise<string> {
  const t = await getTranslations("VendorPage");
  return t("metaTitle", await headlineValues(vendor));
}

export async function getVendorMetadata(categorySlug: string, slug: string): Promise<Metadata> {
  if (!isCategory(categorySlug)) return {};
  const vendor = await getVendor(categorySlug, slug, await getRequestLocale());
  if (!vendor) return {};

  const [t, values] = await Promise.all([getTranslations("VendorPage"), headlineValues(vendor)]);
  const title = t("metaTitle", values);
  const description =
    vendor.description.length < MIN_DESCRIPTION
      ? `${t("metaDescription", values)} ${vendor.description}`.trim()
      : vendor.description;

  return {
    title,
    description,
    ...(await localizedAlternates(`/catalog/${categorySlug}/${slug}`)),
    openGraph: await localizedOpenGraph({ title, description, images: vendor.photos }),
  };
}
