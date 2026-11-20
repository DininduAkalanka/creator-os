/**
 * Founding offer shown on the site. Values come from ADR-014 (Creator plan: $19/month, 5 hours of
 * footage) and Doc 26 §7 (first 50 paying creators, price locked for 12 months).
 * Plan hours are under review (proposal P-11); change them here only after a Decision Log update.
 */
export const FOUNDING_OFFER = {
  planName: "Creator",
  priceUsdPerMonth: 19,
  footageHoursPerMonth: 5,
  priceLockMonths: 12,
  foundingSpots: 50,
} as const;
