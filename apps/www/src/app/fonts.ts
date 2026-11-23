import localFont from "next/font/local";

/*
 * Self-hosted variable fonts from Fontsource (SIL Open Font License 1.1). Served from our own
 * domain: no font requests to third parties. Latin subset only (English first, ADR-020); other
 * scripts fall back to the system font. next/font adds a size-matched fallback to avoid layout shift.
 *
 * v6 type follows adobe.com: one family for headings and text, as Adobe's own site does (its
 * Milo styles set no separate heading font). adobe.com uses Adobe Clean, which only Adobe may
 * use; Source Sans 3 is Adobe's open-source humanist sans (Paul D. Hunt, Adobe Type), the closest
 * relative we are allowed to ship.
 */

/** Headings, text and UI: Source Sans 3, weights 200 to 900, upright and italic (29 KB each). */
export const sansFont = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2",
      weight: "200 900",
      style: "normal",
    },
    {
      // Only downloaded when a page shows italic text. The home page has none (v6.3): the notes
      // are upright, as on adobe.com, so this file never competes with the hero image there.
      path: "../../node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-italic.woff2",
      weight: "200 900",
      style: "italic",
    },
  ],
  variable: "--font-source-sans",
  display: "swap",
  // Not preloaded (adobe.com rule): fonts must not compete with the hero image before LCP.
  preload: false,
});

/** Timecodes and file names inside the product screens (the editor demo, the previews). */
export const monoFont = localFont({
  src: "../../node_modules/@fontsource-variable/martian-mono/files/martian-mono-latin-wght-normal.woff2",
  variable: "--font-martian",
  weight: "100 800",
  display: "swap",
  // Not preloaded (adobe.com rule): fonts must not compete with the hero image before LCP.
  preload: false,
});
