import { describe, expect, it } from "vitest";
import type { Brand, Company } from "@/config/site";
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

describe("launchBlockers", () => {
  it("returns nothing when every launch field is set", () => {
    expect(launchBlockers(readyBrand, readyCompany)).toEqual([]);
  });

  it("lists each missing item", () => {
    const blockers = launchBlockers(
      { ...readyBrand, nameIsFinal: false },
      { ...readyCompany, postalAddress: null, legalTextsReviewed: false },
    );
    expect(blockers).toEqual([
      "Final product name",
      "Business postal address",
      "Lawyer review of the privacy policy and terms",
    ]);
  });
});
