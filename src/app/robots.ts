import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/shared/config/deployment";
import { SITE_URL } from "@/shared/config/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
