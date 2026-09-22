import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { VendorGallery } from "@/features/vendor/VendorGallery";
import { LeadActions } from "@/features/lead/LeadActions";
import { getVendor } from "@/shared/lib/queries";
import { getCategory } from "@/shared/lib/categories";
import { marzLabel } from "@/shared/lib/marz-label";
import { SOCIAL_LABELS, SOCIAL_NETWORKS } from "@/shared/config/social";
import { SocialIcon } from "@/shared/components/SocialIcon";
import { jsonLdHtml, localizedAlternates, SITE_URL } from "@/shared/config/seo";
import { getRequestLocale } from "@/i18n/locale";

export async function VendorScreen({ categorySlug, slug }: { categorySlug: string; slug: string }) {
  const lang = await getRequestLocale();
  const tCrumbs = await getTranslations("Breadcrumbs");
  const tMarz = await getTranslations("Marz");
  const tVendor = await getTranslations("VendorPage");
  const category = await getCategory(categorySlug);
  if (!category) notFound();

  const vendor = await getVendor(category.slug, slug, lang);
  if (!vendor) notFound();

  const region = marzLabel(vendor.marzes, tMarz);
  const links = SOCIAL_NETWORKS.flatMap((network) => {
    const href = vendor.socials[network];
    return href ? [{ network, href }] : [];
  });

  const pageUrl = new URL(
    (await localizedAlternates(`/catalog/${categorySlug}/${slug}`)).alternates.canonical,
    SITE_URL,
  ).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": pageUrl,
    url: pageUrl,
    name: vendor.name,
    description: vendor.description,
    image: vendor.photos,
    address: {
      "@type": "PostalAddress",
      addressRegion: region,
      streetAddress: vendor.address || undefined,
      addressCountry: "AM",
    },
    areaServed: region,
    telephone: vendor.phone,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <div className="mb-8">
        <Breadcrumbs
          locale={lang}
          items={[
            { label: tCrumbs("home"), href: "/" },
            { label: tCrumbs("catalog"), href: "/catalog" },
            { label: category.namePlural, href: `/catalog/${category.slug}` },
            { label: vendor.name },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-[1fr_340px] xl:gap-12">
        <div>
          <VendorGallery photos={vendor.photos} name={vendor.name} />

          <div className="mt-10">
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase">{category.name}</span>
            <h1 className="mt-2 mb-3 font-serif text-[length:var(--text-vendor)] leading-[1.1] text-foreground">
              {vendor.name}
            </h1>
            {region && (
              <div className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{region}</span>
              </div>
            )}

            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">{vendor.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 xl:sticky xl:top-24">
          <LeadActions phone={vendor.phone} />

          {(links.length > 0 || vendor.address) && (
            <div className="border border-border bg-background p-6">
              <div className="mb-4 text-[10px] tracking-wider text-muted-foreground uppercase">{tVendor("links")}</div>
              <div className="flex flex-col gap-3">
                {vendor.address && (
                  <div className="flex items-start gap-2.5 text-sm text-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{vendor.address}</span>
                  </div>
                )}
                {links.map(({ network, href }) => (
                  <a
                    key={network}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-foreground transition-opacity hover:opacity-70"
                  >
                    <SocialIcon network={network} className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="underline decoration-foreground/25 underline-offset-4">
                      {network === "website" ? tVendor("website") : SOCIAL_LABELS[network]}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
