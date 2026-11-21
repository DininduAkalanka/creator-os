import { BRAND } from "@/config/site";
import { LOGO_FULL, LOGO_SYMBOL, LOGO_WORDMARK, type LogoPaths } from "./brand-paths";

/** The logo's red, kept the same on every background (sampled from the supplied logo). */
export const LOGO_ACCENT = "#fe4d49";
/** The logo's navy, for light backgrounds. On dark ones the ink takes the text colour instead. */
export const LOGO_INK = "#0b0a47";

type LogoProps = {
  className?: string;
  /** Hide from assistive technology when the logo sits next to the name in text already. */
  decorative?: boolean;
};

/**
 * The brand drawings (traced from the founder's logo files, see scripts/prepare-logo.mjs).
 * The navy "ink" is drawn in the current text colour, so the logo reads on dark and light
 * backgrounds; the red accent always keeps the logo's red. Size with a height class and
 * `w-auto`; the viewBox keeps the proportions.
 */
function Drawing({ paths, className, decorative }: LogoProps & { paths: LogoPaths }) {
  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": BRAND.name };
  return (
    <svg
      viewBox={`0 0 ${paths.width} ${paths.height}`}
      className={className}
      focusable="false"
      {...a11y}
    >
      <path fill="currentColor" fillRule="evenodd" d={paths.ink} />
      {paths.accent && <path fill={LOGO_ACCENT} fillRule="evenodd" d={paths.accent} />}
    </svg>
  );
}

/** The main logo: the symbol with the name. Use wherever the brand is introduced. */
export function Logo({ className = "h-8 w-auto", decorative = false }: LogoProps) {
  return <Drawing paths={LOGO_FULL} className={className} decorative={decorative} />;
}

/** The symbol only: for small or square places (icons, the 404 page). */
export function LogoSymbol({ className = "size-8", decorative = false }: LogoProps) {
  return <Drawing paths={LOGO_SYMBOL} className={className} decorative={decorative} />;
}

/** The name only, as set in the logo: for the large closing wordmark in the footer. */
export function Wordmark({ className = "h-8 w-auto", decorative = false }: LogoProps) {
  return <Drawing paths={LOGO_WORDMARK} className={className} decorative={decorative} />;
}
