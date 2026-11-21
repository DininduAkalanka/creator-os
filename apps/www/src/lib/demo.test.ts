import { describe, expect, it } from "vitest";
import {
  formatClipTime,
  isSuggestedCut,
  keptSeconds,
  segmentStarts,
  totalSeconds,
  waveform,
  waveformPath,
  type DemoSegment,
} from "./demo";

const segments: DemoSegment[] = [
  { id: "a", kind: "speech", text: "Hello", seconds: 5.6 },
  { id: "b", kind: "pause", text: "pause", seconds: 4.2 },
  { id: "c", kind: "retake", text: "again", seconds: 3.8 },
  { id: "d", kind: "speech", text: "world", seconds: 3.1 },
  { id: "e", kind: "filler", text: "um", seconds: 1.9 },
];

describe("cut demo logic", () => {
  it("treats everything except speech as a suggested cut", () => {
    expect(segments.filter(isSuggestedCut).map((s) => s.id)).toEqual(["b", "c", "e"]);
  });

  it("adds up the clip length without floating-point noise", () => {
    expect(totalSeconds(segments)).toBe(18.6);
  });

  it("removes only accepted cuts", () => {
    expect(keptSeconds(segments, new Set())).toBe(18.6);
    expect(keptSeconds(segments, new Set(["b"]))).toBe(14.4);
    expect(keptSeconds(segments, new Set(["b", "c", "e"]))).toBe(8.7);
  });

  it("never removes speech, even if its id is passed", () => {
    expect(keptSeconds(segments, new Set(["a", "missing"]))).toBe(18.6);
  });

  it.each([
    [0, "0:00.0"],
    [8.7, "0:08.7"],
    [74.25, "1:14.3"],
    [59.96, "1:00.0"],
    [-3, "0:00.0"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatClipTime(seconds)).toBe(expected);
  });

  it("returns where each segment starts", () => {
    expect(segmentStarts(segments)).toEqual([0, 5.6, 9.8, 13.6, 16.7]);
  });

  it("draws the same waveform for the same segment every time", () => {
    expect(waveform("a", 12, "speech")).toEqual(waveform("a", 12, "speech"));
    expect(waveform("a", 12, "speech")).not.toEqual(waveform("d", 12, "speech"));
  });

  it("draws a whole waveform as one path with one sub-path per bar", () => {
    expect(waveformPath([0.5, 1])).toBe("M0.2 27h0.6v46h-0.6zM1.2 4h0.6v92h-0.6z");
    expect(waveformPath([0, 0.5, 1], { only: (index) => index !== 1 }).match(/M/g)).toHaveLength(2);
    expect(waveformPath([0])).toBe("M0.2 49h0.6v2h-0.6z");
  });

  it("keeps waveform heights in range and pauses near-flat", () => {
    const speech = waveform("a", 40, "speech");
    const pause = waveform("b", 40, "pause");
    expect(speech).toHaveLength(40);
    expect(Math.min(...speech)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...speech)).toBeLessThanOrEqual(1);
    expect(Math.max(...pause)).toBeLessThanOrEqual(0.1);
  });
});
