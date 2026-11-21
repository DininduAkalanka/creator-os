"use client";

import { useId, useState, type CSSProperties } from "react";
import { demo } from "@/content/home";
import {
  formatClipTime,
  isSuggestedCut,
  keptSeconds,
  segmentStarts,
  totalSeconds,
  waveform,
  waveformPath,
  type DemoSegment,
} from "@/lib/demo";

const BARS_PER_SECOND = 4;
const segments = demo.segments;
const cutIds = segments.filter(isSuggestedCut).map((segment) => segment.id);
const total = totalSeconds(segments);
const starts = segmentStarts(segments);
/** Waveform paths, computed once: one SVG path per segment. */
const waves = new Map(
  segments.map((segment) => {
    const bars = Math.max(4, Math.round(segment.seconds * BARS_PER_SECOND));
    const path = waveformPath(waveform(segment.id, bars, segment.kind));
    return [segment.id, { bars, path }] as const;
  }),
);

/**
 * The hero demo: a clip with suggested cuts. Accepting a cut collapses it on the timeline and
 * shortens the clip. The transcript holds the accessible controls (real toggle buttons); the
 * timeline mirrors them visually and is hidden from assistive technology.
 */
export function CutDemo() {
  const headingId = useId();
  const [accepted, setAccepted] = useState<ReadonlySet<string>>(() => new Set());

  const length = keptSeconds(segments, accepted);
  const removed = Math.round((total - length) * 10) / 10;
  const allAccepted = accepted.size === cutIds.length;

  function toggle(id: string) {
    setAccepted((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <figure
      aria-labelledby={headingId}
      className="relative overflow-hidden rounded-[1.25rem] border border-line-strong bg-raised shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          <p id={headingId} className="text-sm font-semibold">
            {demo.heading}
          </p>
        </div>
        <p className="label-mono truncate text-faint">{demo.clipName}</p>
      </div>

      {/* Timeline: a visual mirror of the transcript controls. */}
      <div aria-hidden="true" className="px-4 pt-4 sm:px-5">
        <div className="ruler h-3 opacity-80" />
        <div className="relative mt-7 flex h-16 sm:h-20">
          {segments.map((segment, index) => (
            <TimelineSegment
              key={segment.id}
              segment={segment}
              at={(starts[index] ?? 0) / total}
              accepted={accepted.has(segment.id)}
              onToggle={() => toggle(segment.id)}
            />
          ))}
          {/* Full-width track moved by transform; the line sits at its left edge. */}
          <span className="demo-playhead pointer-events-none absolute inset-x-0 -top-6 -bottom-1 opacity-0">
            <span className="absolute inset-y-0 left-0 w-px bg-fg" />
            <span className="absolute -top-0.5 -left-1 size-2 rotate-45 bg-fg" />
          </span>
        </div>
      </div>

      {/* Transcript: the accessible controls. */}
      <div className="px-4 pt-5 pb-4 sm:px-5">
        <p className="label-mono text-faint">{demo.transcriptHeading}</p>
        <p className="mt-2 text-[0.95rem] leading-8 text-pretty">
          {segments.map((segment) =>
            isSuggestedCut(segment) ? (
              <TranscriptCut
                key={segment.id}
                segment={segment}
                accepted={accepted.has(segment.id)}
                onToggle={() => toggle(segment.id)}
              />
            ) : (
              <span key={segment.id}>{segment.text} </span>
            ),
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
        <p className="flex items-baseline gap-2 font-mono text-xs text-muted">
          <span className="label-mono text-faint">{demo.lengthLabel}</span>
          <span className="text-fg tabular-nums">{formatClipTime(length)}</span>
          {removed > 0 && <span className="text-accent tabular-nums">−{removed.toFixed(1)} s</span>}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAccepted(new Set())}
            disabled={accepted.size === 0}
            className="rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-40"
          >
            {demo.reset}
          </button>
          <button
            type="button"
            onClick={() => setAccepted(new Set(cutIds))}
            disabled={allAccepted}
            className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {demo.acceptAll}
          </button>
        </div>
      </div>

      <p role="status" className="sr-only">
        {demo.status(accepted.size, cutIds.length, formatClipTime(length))}
      </p>
      <figcaption className="border-t border-line bg-bg/40 px-4 py-2.5 text-xs text-faint italic sm:px-5">
        {demo.label}
      </figcaption>
    </figure>
  );
}

function TimelineSegment(props: {
  segment: DemoSegment;
  at: number;
  accepted: boolean;
  onToggle: () => void;
}) {
  const { segment, accepted } = props;
  const wave = waves.get(segment.id);
  const isCut = isSuggestedCut(segment);
  const waveSvg = wave && (
    <svg
      viewBox={`0 0 ${wave.bars} 100`}
      preserveAspectRatio="none"
      className={`h-full w-full ${isCut ? "text-accent" : "text-fg/70"}`}
    >
      <path d={wave.path} fill="currentColor" />
    </svg>
  );

  const style = { flexGrow: accepted ? 0.0001 : segment.seconds, flexBasis: 0 };
  if (!isCut) {
    return (
      <div
        style={style}
        className="demo-segment mr-1 min-w-0 rounded-md border border-line bg-panel px-1 py-2"
      >
        {waveSvg}
      </div>
    );
  }

  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={props.onToggle}
      style={style}
      className={`demo-segment hatch group relative min-w-0 rounded-md border border-dashed border-accent/70 px-1 py-2 ${
        accepted ? "mr-0 opacity-0" : "mr-1 opacity-100"
      }`}
    >
      <span
        style={{ "--at": props.at } as CSSProperties}
        className="demo-flag label-mono absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-accent px-1.5 py-0.5 text-[0.5625rem] whitespace-nowrap text-on-accent"
      >
        <span className="hidden sm:inline">
          {demo.kindLabels[segment.kind as keyof typeof demo.kindLabels]}
        </span>
        <span className="sm:hidden">✕</span>
      </span>
      {waveSvg}
    </button>
  );
}

function TranscriptCut(props: { segment: DemoSegment; accepted: boolean; onToggle: () => void }) {
  const { segment, accepted } = props;
  const kind = demo.kindLabels[segment.kind as keyof typeof demo.kindLabels];
  const isPause = segment.kind === "pause";
  return (
    <>
      <button
        type="button"
        aria-pressed={accepted}
        onClick={props.onToggle}
        className={`rounded-md px-1 py-0.5 text-left transition-colors ${
          accepted
            ? "text-faint line-through decoration-accent decoration-2"
            : "bg-accent-soft text-fg underline decoration-accent decoration-wavy decoration-1 underline-offset-4 hover:bg-accent/25"
        } ${isPause ? "font-mono text-xs" : ""}`}
      >
        <span className="sr-only">{`${demo.cutPrefix} ${kind.toLowerCase()}: `}</span>
        {isPause ? `[${segment.text}]` : segment.text}
      </button>{" "}
    </>
  );
}
