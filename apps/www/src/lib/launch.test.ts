import { describe, expect, it } from "vitest";
import type { Brand, Company, Features } from "@/config/site";
import { launchBlockers } from "./launch";

const readyBrand: Brand = { name: "Example", nameIsFinal: true };
const readyCompany: Company = {
  legalName: "Example Ltd",
  postalAddress: "1 Example Street, Example City",
  contactEmail: "hello@example.com",
  privacyEmail: "privacy@example.com",
  founderName: "Example Founder",
  legalTextsReviewed: true,
};
const readyFeatures: Features = { waitlistStorage: true };

describe("launchBlockers", () => {
  it("returns nothing when every launch item is done", () => {
    expect(launchBlockers(readyBrand, readyCompany, readyFeatures)).toEqual([]);
  });

  it("lists each missing item", () => {
    const blockers = launchBlockers(
      { ...readyBrand, nameIsFinal: false },
      { ...readyCompany, postalAddress: null, legalTextsReviewed: false },
      { waitlistStorage: false },
    );
    expect(blockers).toEqual([
      "Final product name",
      "Business postal address",
      "Lawyer review of the privacy policy and terms",
      "Waitlist storage and confirmation email",
    ]);
  });
});
