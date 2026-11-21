/** Shared class lists, so buttons, containers and cards look the same everywhere. */

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

/** The one call to action: the logo's navy on light sections, a white pill on dark ones. */
export const buttonPrimary = `${buttonBase} bg-ink px-5 py-2.5 text-sm text-on-ink hover:bg-ink-strong hover:shadow-float`;

/** Outlined pill (adobe.com "Sign in" / "See all products"). */
export const buttonSecondary = `${buttonBase} border border-fg/25 px-5 py-2.5 text-sm text-fg hover:border-fg hover:bg-fg/[0.04]`;

export const buttonLarge = "px-6 py-3.5 text-base";

export const card = "rounded-[var(--radius)] border border-line bg-raised";
