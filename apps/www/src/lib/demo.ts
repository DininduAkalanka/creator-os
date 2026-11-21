/**
 * Logic for the interactive cut demo on the home page. Pure and deterministic, so the server
 * render and the browser render match (no Math.random, no Date).
 */

export type SegmentKind = "speech" | "pause" | "filler" | "retake";

export interface DemoSegment {
  id: string;
  kind: SegmentKind;
  /** What is said (or a description of the pause). */
  text: string;
  seconds: number;
}

/** A suggested cut is any segment that isn't speech. */
export function isSuggestedCut(segment: DemoSegment): boolean {
  return segment.kind !== "speech";
}

export function totalSeconds(segments: readonly DemoSegment[]): number {
  return roundTenth(segments.reduce((sum, segment) => sum + segment.seconds, 0));
}

/** Length of the clip after the accepted cuts are removed. Unknown ids are ignored. */
export function keptSeconds(
  segments: readonly DemoSegment[],
  acceptedCutIds: ReadonlySet<string>,
): number {
  return roundTenth(
    segments
      .filter((segment) => !(isSuggestedCut(segment) && acceptedCutIds.has(segment.id)))
      .reduce((sum, segment) => sum + segment.seconds, 0),
  );
}

/** Formats seconds as m:ss.t, e.g. 74.25 -> "1:14.3". Negative input is treated as 0. */
export function formatClipTime(seconds: number): string {
  const tenths = Math.round(Math.max(0, seconds) * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  const [whole, fraction] = rest.toFixed(1).split(".");
  return `${minutes}:${(whole ?? "0").padStart(2, "0")}.${fraction ?? "0"}`;
}

/** Start time of each segment in seconds, e.g. lengths [5.6, 4.2, 3.8] -> [0, 5.6, 9.8]. */
export function segmentStarts(segments: readonly DemoSegment[]): number[] {
  const starts: number[] = [];
  let at = 0;
  for (const segment of segments) {
    starts.push(roundTenth(at));
    at += segment.seconds;
  }
  return starts;
}

/**
 * Bar heights (0..1) for a drawn waveform. Seeded by the segment id, so the same segment always
 * draws the same shape. Pauses are near-flat.
 */
export function waveform(id: string, bars: number, kind: SegmentKind): number[] {
  let seed = 2166136261;
  for (const char of id) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  const next = () => {
    // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const floor = kind === "pause" ? 0.04 : 0.18;
  const range = kind === "pause" ? 0.06 : 0.82;
  return Array.from({ length: bars }, (_, index) => {
    // An envelope so each word swells and fades instead of looking like noise.
    const envelope =
      kind === "pause" ? 1 : 0.55 + 0.45 * Math.sin((Math.PI * (index + 0.5)) / bars);
    return roundHundredth(floor + range * next() * envelope);
  });
}

/**
 * One SVG path for a whole waveform (viewBox "0 0 <bars> 100"), instead of one element per bar:
 * fewer DOM nodes means less work for the browser and for React hydration.
 * Bars are vertically centred; `width` is the bar width as a fraction of each slot.
 */
export function waveformPath(
  heights: readonly number[],
  options: { width?: number; minHeight?: number; only?: (index: number) => boolean } = {},
): string {
  const width = options.width ?? 0.6;
  const minHeight = options.minHeight ?? 2;
  const offset = (1 - width) / 2;
  let path = "";
  heights.forEach((height, index) => {
    if (options.only && !options.only(index)) return;
    const barHeight = Math.max(minHeight, height * 92);
    const top = roundHundredth(50 - barHeight / 2);
    path += `M${roundHundredth(index + offset)} ${top}h${width}v${roundHundredth(barHeight)}h-${width}z`;
  });
  return path;
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}
