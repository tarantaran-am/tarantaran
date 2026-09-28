import { getCategories } from "@/shared/lib/categories";
import { Hero } from "@/features/landing/Hero";
import { BlogTeaser } from "@/features/landing/BlogTeaser";
import { Categories } from "@/features/landing/Categories";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { Inspiration } from "@/features/landing/Inspiration";
import { CTA } from "@/features/landing/CTA";
import { JsonLd } from "@/shared/components/JsonLd";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/shared/config/seo";
import { BRAND, CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS } from "@/shared/config/site";

// One name for the brand in every language; the other spellings people search for point search engines to it.
const organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BRAND,
  alternateName: ["Տարան Տարան", "Tarantaran", "tarantaran.am"],
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  areaServed: { "@type": "Country", name: "Armenia" },
  sameAs: SOCIAL_LINKS.map((link) => link.href),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organization,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BRAND,
      alternateName: organization.alternateName,
      url: SITE_URL,
      inLanguage: routing.locales,
      publisher: { "@id": organization["@id"] },
    },
  ],
};

export async function HomeScreen() {
  const categories = await getCategories();

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero categories={categories} />
      <Categories />
      <BlogTeaser />
      <HowItWorks />
      <Inspiration />
      <CTA />
    </>
  );
}
