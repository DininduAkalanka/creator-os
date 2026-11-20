import Link from "next/link";
import { BRAND } from "@/config/site";
import { siteCopy } from "@/content/site";
import { LogoMark } from "./logo";
import { buttonPrimary, container } from "./styles";

export function SiteHeader() {
  const { nav } = siteCopy;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className={`${container} flex h-16 items-center justify-between gap-4`}>
        <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
          <LogoMark />
          {BRAND.name}
        </Link>
        <nav aria-label={nav.label}>
          <ul className="flex items-center gap-6 text-sm">
            <li className="hidden md:block">
              <Link href="/#how-it-works" className="text-muted hover:text-ink">
                {nav.howItWorks}
              </Link>
            </li>
            <li className="hidden md:block">
              <Link href="/#offer" className="text-muted hover:text-ink">
                {nav.offer}
              </Link>
            </li>
            <li className="hidden md:block">
              <Link href="/#faq" className="text-muted hover:text-ink">
                {nav.faq}
              </Link>
            </li>
            <li>
              <Link href="/#waitlist" className={buttonPrimary}>
                {nav.cta}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
