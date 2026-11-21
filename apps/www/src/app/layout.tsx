import type { Metadata, Viewport } from "next";
import { PreviewNotice } from "@/components/notices";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND, SITE_INDEXABLE, SITE_URL } from "@/config/site";
import { siteCopy } from "@/content/site";
import { displayFont, monoFont, sansFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: siteCopy.titleDefault, template: `%s · ${BRAND.name}` },
  description: siteCopy.description,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: siteCopy.titleDefault,
    description: siteCopy.description,
  },
  twitter: { card: "summary_large_image" },
  // Belt and braces with robots.ts: previews must never be indexed.
  robots: SITE_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-[70] rounded-full bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {siteCopy.skipLink}
        </a>
        <PreviewNotice />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
