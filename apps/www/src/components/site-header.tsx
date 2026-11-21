import Link from "next/link";
import { BRAND } from "@/config/site";
import { siteCopy } from "@/content/site";
import { HeaderShell } from "./header-shell";
import { LogoMark } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { ProductMenu } from "./product-menu";
import { buttonPrimary, container } from "./styles";

export function SiteHeader() {
  const { nav } = siteCopy;
  const sectionLinks = [
    { href: "/#try-it", label: nav.tryIt },
    { href: "/#channel-audit", label: nav.audit },
    { href: "/#plans", label: nav.plans },
    { href: "/#faq", label: nav.faq },
  ];
  // Phones get a plain list; on large screens "Product" opens the adobe.com-style menu instead.
  const links = [{ href: "/#product", label: nav.product }, ...sectionLinks];
  return (
    <HeaderShell>
      <div className={`${container} relative flex h-16 items-center justify-between gap-4`}>
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-tight"
        >
          <LogoMark />
          {BRAND.name}
        </Link>
        <nav aria-label={nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm">
            <li>
              <ProductMenu />
            </li>
            {sectionLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-fg/80 transition-colors hover:bg-panel hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {/* Wrapper: the button's own inline-flex would override "hidden". */}
          <div className="hidden sm:block">
            <Link href="/#waitlist" className={buttonPrimary}>
              {nav.cta}
            </Link>
          </div>
          <MobileMenu links={links} />
        </div>
      </div>
    </HeaderShell>
  );
}
