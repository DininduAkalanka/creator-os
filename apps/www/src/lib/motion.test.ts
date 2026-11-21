import { describe, expect, it } from "vitest";
import { revealDelay, SWIPE_MIN_DISTANCE, swipeStep } from "./motion";

describe("swipeStep", () => {
  it("moves to the next slide when the finger moves left", () => {
    expect(swipeStep(-120, 10)).toBe(1);
  });

  it("moves to the previous slide when the finger moves right", () => {
    expect(swipeStep(120, -10)).toBe(-1);
  });

  it("ignores short drags and taps", () => {
    expect(swipeStep(0, 0)).toBe(0);
    expect(swipeStep(-(SWIPE_MIN_DISTANCE - 1), 0)).toBe(0);
    expect(swipeStep(-SWIPE_MIN_DISTANCE, 0)).toBe(1);
  });

  it("ignores mostly vertical drags, because that is the visitor scrolling", () => {
    expect(swipeStep(-80, 300)).toBe(0);
    expect(swipeStep(90, -61)).toBe(0);
    expect(swipeStep(90, -59)).toBe(-1);
  });

  it("flips direction in right-to-left layouts", () => {
    expect(swipeStep(-120, 0, true)).toBe(-1);
    expect(swipeStep(120, 0, true)).toBe(1);
  });
});

describe("revealDelay", () => {
  it("staggers items in steps", () => {
    expect([0, 1, 2].map((order) => revealDelay(order))).toEqual([0, 90, 180]);
  });

  it("caps the delay so long lists never lag behind the scroll", () => {
    expect(revealDelay(50)).toBe(revealDelay(4));
  });

  it("treats odd input as the first item", () => {
    expect(revealDelay(-3)).toBe(0);
    expect(revealDelay(Number.NaN)).toBe(0);
  });
});
