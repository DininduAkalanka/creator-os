/** Shared class lists, so buttons and containers look the same everywhere. */

export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70";

export const buttonPrimary = `${buttonBase} bg-accent text-on-accent hover:bg-accent-strong`;

export const buttonSecondary = `${buttonBase} border border-line bg-surface text-ink hover:bg-surface-2`;

export const card = "rounded-2xl border border-line bg-surface";
