import Link from "next/link";
import { BRAND, COMPANY } from "@/config/site";
import { serviceIcons, services } from "@/content/services";
import { siteCopy } from "@/content/site";
import { ServiceIcon } from "./service-icon";
import { Logo, Wordmark } from "./logo";
import { EmailLink } from "./missing-value";
import { buttonPrimary, container } from "./styles";

export function SiteFooter() {
  const { footer } = siteCopy;
  // Only the company details we have: a public footer never prints "[to be added]". What is
  // still missing is listed in the preview notice at the top until launch.
  const companyLines = [COMPANY.legalName, COMPANY.postalAddress].filter(Boolean);
  const showCompany = companyLines.length > 0 || Boolean(COMPANY.contactEmail);
  return (
    // Black, like adobe.com's footer: the one place every page ends in the dark, with the
    // closing wordmark. The rest of the site is light.
    <footer className="theme-dark mt-auto">
      <div className={`${container} pt-20 pb-16`}>
        <div className="flex flex-col items-start justify-between gap-8 border-b border-line pb-12 lg:flex-row lg:items-end">
          <p className="display max-w-2xl text-4xl text-balance sm:text-6xl">{footer.statement}</p>
          <Link href="/#waitlist" className={`${buttonPrimary} px-6 py-3.5 text-base`}>
            {footer.cta}
          </Link>
        </div>

        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className={showCompany ? "lg:col-span-2" : "lg:col-span-3"}>
            <p className="text-fg">
              <Logo className="h-9 w-auto" />
            </p>
            <p className="mt-4 max-w-sm text-sm text-muted">{footer.tagline}</p>
          </div>

          {/* Every service with its icon, as adobe.com's footer lists its featured products. */}
          <nav aria-labelledby="footer-product">
            <h2 id="footer-product" className="text-sm font-bold text-fg">
              {footer.productHeading}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.cards.map((card) => (
                <li key={card.id}>
                  <Link
                    href={`/${card.href}`}
                    className="inline-flex items-center gap-2.5 text-muted transition-colors hover:text-fg"
                  >
                    <ServiceIcon name={serviceIcons[card.id] ?? "rough-cut"} size="xs" />
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className="text-sm font-bold text-fg">
              {footer.legalHeading}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-muted transition-colors hover:text-fg">
                  {footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted transition-colors hover:text-fg">
                  {footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted transition-colors hover:text-fg">
                  {footer.about}
                </Link>
              </li>
            </ul>
          </nav>

          {showCompany && (
            <div>
              <h2 className="text-sm font-bold text-fg">{footer.companyHeading}</h2>
              <address className="mt-4 space-y-1.5 text-sm text-muted not-italic">
                {companyLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {COMPANY.contactEmail && (
                  <p>
                    <EmailLink email={COMPANY.contactEmail} />
                  </p>
                )}
              </address>
            </div>
          )}
        </div>

        <div className="mt-12 space-y-2 border-t border-line pt-6 text-xs text-faint">
          {!BRAND.nameIsFinal && <p>{footer.workingName}</p>}
          <p>{footer.trademarks}</p>
        </div>
      </div>

      {/*
       * Closing wordmark (adobe.com-style): the name as set in the logo, the full width of the
       * page. It rises from behind the clipped edge as the page ends (scroll-linked, globals.css).
       * overflow-clip, not hidden: a hidden box would become the scroll timeline instead of the page.
       */}
      <div className={`${container} overflow-clip pb-6 text-fg sm:pb-10`}>
        <Wordmark decorative className="wordmark-rise block h-auto w-full" />
      </div>
    </footer>
  );
}
