import { Fragment } from "react";
import { Link, getPathname } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { SITE_URL } from "@/shared/config/seo";
import { JsonLd } from "@/shared/components/JsonLd";
import { Locale } from "@/shared/model/types";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items, locale }: { items: Crumb[]; locale: Locale }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: new URL(getPathname({ href: item.href, locale }), SITE_URL).toString() } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink render={<Link href={item.href} locale={locale} />}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
