import Link from "next/link";
import { BRAND } from "@/config/site";
import { siteCopy } from "@/content/site";
import { LogoMark } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { buttonPrimary, container } from "./styles";

export function SiteHeader() {
  const { nav } = siteCopy;
  const links = [
    { href: "/#how-it-works", label: nav.howItWorks },
    { href: "/#features", label: nav.features },
    { href: "/#offer", label: nav.offer },
    { href: "/#faq", label: nav.faq },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150">
      <div className={`${container} relative flex h-16 items-center justify-between gap-4`}>
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-tight"
        >
          <LogoMark />
          {BRAND.name}
        </Link>
        <nav aria-label={nav.label} className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-muted transition-colors hover:bg-panel hover:text-fg"
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
    </header>
  );
}
