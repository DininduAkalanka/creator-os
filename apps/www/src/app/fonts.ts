import localFont from "next/font/local";

/*
 * Self-hosted variable fonts from Fontsource (SIL Open Font License 1.1). Served from our own
 * domain: no font requests to third parties. Latin subset only (English first, ADR-020); other
 * scripts fall back to the system font. next/font adds a size-matched fallback to avoid layout shift.
 */

/** Display: headlines. Optical sizes give it more character at large sizes. */
export const displayFont = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

/** Body text and UI. */
export const sansFont = localFont({
  src: "../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
  variable: "--font-instrument",
  weight: "400 700",
  display: "swap",
});

/** Timecodes, labels and file names: the editing-suite detail. */
export const monoFont = localFont({
  src: "../../node_modules/@fontsource-variable/martian-mono/files/martian-mono-latin-wght-normal.woff2",
  variable: "--font-martian",
  weight: "100 800",
  display: "swap",
});
