import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

const PATHS = ["/", "/about", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
