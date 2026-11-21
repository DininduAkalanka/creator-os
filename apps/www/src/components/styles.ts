/** Shared class lists, so buttons, containers and cards look the same everywhere. */

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${buttonBase} bg-accent px-5 py-2.5 text-sm text-on-accent hover:bg-accent-strong`;

export const buttonSecondary = `${buttonBase} border border-line-strong px-5 py-2.5 text-sm text-fg hover:border-fg/40 hover:bg-panel`;

export const buttonLarge = "px-6 py-3.5 text-base";

export const card = "rounded-[var(--radius)] border border-line bg-raised";
