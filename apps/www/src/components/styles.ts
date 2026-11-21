/** Shared class lists, so buttons, containers and cards look the same everywhere. */

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The one call to action: the logo's navy on light sections, a white pill on dark ones.
 * Bold, pill-shaped, 2 px border (adobe.com's Milo buttons: weight 700, 2 px border).
 */
export const buttonPrimary = `${buttonBase} border-ink bg-ink px-5 py-2 text-[0.9375rem] text-on-ink hover:border-ink-strong hover:bg-ink-strong hover:shadow-float`;

/** Outlined pill (adobe.com "Sign in" / "See all products"): fills in on hover. */
export const buttonSecondary = `${buttonBase} border-fg px-5 py-2 text-[0.9375rem] text-fg hover:bg-fg hover:text-bg`;

export const buttonLarge = "px-6 py-2.5 text-[1.0625rem]";

export const card = "rounded-[var(--radius)] border border-line bg-raised";
