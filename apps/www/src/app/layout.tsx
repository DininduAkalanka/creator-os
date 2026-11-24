import type { Metadata, Viewport } from "next";
import { PreviewNotice } from "@/components/notices";
import { SectionLinkScroll } from "@/components/section-link-scroll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND, SITE_INDEXABLE, SITE_URL } from "@/config/site";
import { siteCopy } from "@/content/site";
import { monoFont, sansFont } from "./fonts";
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
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: the page scrolls smoothly (globals.css), and this lets Next.js turn
    // that off while it moves to another page. Without it, its scroll to the new page's top was
    // animated and could stop halfway (home from /privacy landed 703 px down).
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sansFont.variable} ${monoFont.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-[70] rounded-full bg-ink px-4 py-2 font-semibold text-on-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {siteCopy.skipLink}
        </a>
        <PreviewNotice />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <SectionLinkScroll />
      </body>
    </html>
  );
}
