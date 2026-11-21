/** Minimum sideways travel, in CSS pixels, before a touch drag counts as a swipe. */
export const SWIPE_MIN_DISTANCE = 48;

/**
 * Decides whether a touch drag was a sideways swipe, and which way a slideshow should move.
 * Returns 1 (next), -1 (previous) or 0 (not a swipe: too short, or mostly vertical, which is the
 * visitor scrolling the page). In right-to-left layouts the directions flip.
 */
export function swipeStep(dx: number, dy: number, rtl = false): -1 | 0 | 1 {
  if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  const towardsStart = dx < 0; // the finger moved left: show what is to the right
  return towardsStart !== rtl ? 1 : -1;
}

/** Stagger for items revealed together: 0, 90, 180… ms, capped so long lists never lag. */
export function revealDelay(order: number, stepMs = 90, maxSteps = 4): number {
  const step = Number.isFinite(order) ? Math.trunc(order) : 0;
  return Math.min(Math.max(step, 0), maxSteps) * stepMs;
}
