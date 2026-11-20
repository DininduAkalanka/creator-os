import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/config/site";

/** Crawlers are allowed only when SITE_INDEXABLE=true (the production launch). */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
