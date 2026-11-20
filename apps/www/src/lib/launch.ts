import type { Brand, Company } from "@/config/site";

/**
 * Lists what still blocks a public launch. Empty array = ready.
 * The site shows a preview notice while anything is listed.
 */
export function launchBlockers(brand: Brand, company: Company): string[] {
  const blockers: string[] = [];
  if (!brand.nameIsFinal) blockers.push("Final product name");
  if (!company.legalName) blockers.push("Company legal name");
  if (!company.postalAddress) blockers.push("Business postal address");
  if (!company.contactEmail) blockers.push("Contact email");
  if (!company.privacyEmail) blockers.push("Privacy contact email");
  if (!company.founderName) blockers.push("Founder name");
  if (!company.legalTextsReviewed) blockers.push("Lawyer review of the privacy policy and terms");
  return blockers;
}
