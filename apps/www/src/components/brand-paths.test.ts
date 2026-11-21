import { describe, expect, it } from "vitest";
import { LOGO_FULL, LOGO_SYMBOL, LOGO_WORDMARK, type LogoPaths } from "./brand-paths";

// Guards the generated file (scripts/prepare-logo.mjs): a broken trace must not ship silently.
const drawings: Array<[string, LogoPaths, boolean]> = [
  ["full logo", LOGO_FULL, true],
  ["symbol", LOGO_SYMBOL, true],
  ["wordmark", LOGO_WORDMARK, false],
];

describe("brand logo paths", () => {
  it.each(drawings)("%s has a size and closed outlines", (_name, drawing, hasAccent) => {
    expect(drawing.width).toBeGreaterThan(0);
    expect(drawing.height).toBeGreaterThan(0);
    expect(drawing.ink).toMatch(/^M[^Mz]+z(M[^Mz]+z)*$/);
    if (hasAccent) expect(drawing.accent).toMatch(/^M[^Mz]+z(M[^Mz]+z)*$/);
    else expect(drawing.accent).toBe("");
  });

  it("keeps the logo's proportions: wide lockup, near-square symbol, long name", () => {
    expect(LOGO_FULL.width / LOGO_FULL.height).toBeCloseTo(3.34, 1);
    expect(LOGO_SYMBOL.width / LOGO_SYMBOL.height).toBeCloseTo(0.87, 1);
    expect(LOGO_WORDMARK.width / LOGO_WORDMARK.height).toBeCloseTo(6.23, 1);
  });
});
