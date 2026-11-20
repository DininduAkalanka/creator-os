/**
 * Every user-facing brand and company string lives here (AGENTS.md §1).
 * "CreatorOS" is the internal code name; the product name is not final.
 * Fields set to null are unknown today and must be filled before public launch
 * (see launchBlockers in src/lib/launch.ts). Never invent them.
 */

export interface Brand {
  name: string;
  nameIsFinal: boolean;
}

export interface Company {
  /** Registered company name. */
  legalName: string | null;
  /** Physical postal address; US CAN-SPAM requires it in every marketing email. */
  postalAddress: string | null;
  contactEmail: string | null;
  privacyEmail: string | null;
  founderName: string | null;
  /** True only after a lawyer has reviewed the privacy policy and terms. */
  legalTextsReviewed: boolean;
}

export const BRAND: Brand = {
  name: "CreatorOS",
  nameIsFinal: false,
};

export const COMPANY: Company = {
  legalName: null,
  postalAddress: null,
  contactEmail: null,
  privacyEmail: null,
  founderName: null,
  legalTextsReviewed: false,
};

export interface Features {
  /**
   * True only in the same change that makes the joinWaitlist action save sign-ups and send the
   * confirmation email. Until then the form says, truthfully, that sign-ups are not open.
   */
  waitlistStorage: boolean;
}

export const FEATURES: Features = {
  waitlistStorage: false,
};

/** Public URL of this site; set NEXT_PUBLIC_SITE_URL in each environment. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Search engines may index the site only when this is explicitly "true" (off for previews). */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
