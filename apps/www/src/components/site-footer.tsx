import Link from "next/link";
import { BRAND, COMPANY } from "@/config/site";
import { siteCopy } from "@/content/site";
import { LogoMark } from "./logo";
import { EmailLink, MissingValue } from "./missing-value";
import { container } from "./styles";

export function SiteFooter() {
  const { footer } = siteCopy;
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className={`${container} grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4`}>
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2.5 font-semibold">
            <LogoMark className="size-6" />
            {BRAND.name}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">{footer.tagline}</p>
        </div>

        <nav aria-labelledby="footer-legal">
          <h2 id="footer-legal" className="text-sm font-semibold">
            {footer.legalHeading}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="text-muted hover:text-ink">
                {footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted hover:text-ink">
                {footer.terms}
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-muted hover:text-ink">
                {footer.about}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">{footer.companyHeading}</h2>
          <address className="mt-3 space-y-1 text-sm not-italic text-muted">
            <p>
              <MissingValue value={COMPANY.legalName} />
            </p>
            <p>
              <MissingValue value={COMPANY.postalAddress} />
            </p>
            <p>
              <EmailLink email={COMPANY.contactEmail} />
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-line">
        <div className={`${container} space-y-2 py-6 text-xs text-muted`}>
          {!BRAND.nameIsFinal && <p>{footer.workingName}</p>}
          <p>{footer.trademarks}</p>
        </div>
      </div>
    </footer>
  );
}
