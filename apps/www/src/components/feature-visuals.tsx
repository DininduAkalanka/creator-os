/**
 * Small illustrations for the feature cards and the problem section. Pure HTML/SVG and CSS:
 * no images to download. Decorative (aria-hidden): each card's text says the same thing.
 */
import { features, problem } from "@/content/home";
import { waveform, waveformPath } from "@/lib/demo";

/** A long raw clip with many hand-cut marks: the problem, drawn. */
export function ProblemTimeline() {
  const bars = waveform("raw-hour", 120, "speech");
  // Every few bars, a mark that someone would have to find and cut.
  const marked = new Set([
    4, 5, 13, 21, 22, 23, 30, 38, 46, 47, 55, 63, 64, 71, 80, 88, 89, 97, 105, 113,
  ]);
  return (
    <figure className="reveal">
      <div
        aria-hidden="true"
        className="rounded-[var(--radius)] border border-line bg-raised p-4 sm:p-6"
      >
        <div className="ruler h-3 opacity-70" />
        {/* Two paths (kept and marked bars) instead of one element per bar. */}
        <svg
          viewBox={`0 0 ${bars.length} 100`}
          preserveAspectRatio="none"
          className="mt-3 h-24 w-full sm:h-32"
        >
          <path
            d={waveformPath(bars, { width: 0.7, minHeight: 6, only: (i) => !marked.has(i) })}
            className="fill-fg/25"
          />
          <path
            d={waveformPath(bars, { width: 0.7, minHeight: 6, only: (i) => marked.has(i) })}
            className="fill-accent"
          />
        </svg>
        <div className="mt-3 flex justify-between font-mono text-[0.625rem] text-faint">
          <span>00:00</span>
          <span>15:00</span>
          <span>30:00</span>
          <span>45:00</span>
          <span>58:40</span>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-faint italic">{problem.timelineCaption}</figcaption>
    </figure>
  );
}

export function RoughCutVisual() {
  return (
    <div aria-hidden="true" className="space-y-2.5 font-mono text-[0.72rem] leading-6 text-muted">
      <p>
        <span className="text-faint">00:12 </span>
        <span className="rounded bg-accent-soft px-1 text-accent line-through decoration-2">
          So, um,
        </span>{" "}
        <span className="text-fg">here&apos;s the plan for the month</span>
      </p>
      <p>
        <span className="text-faint">00:19 </span>
        <span className="rounded bg-accent-soft px-1 text-accent line-through decoration-2">
          [pause 3.1 s]
        </span>
      </p>
      <p>
        <span className="text-faint">00:22 </span>
        <span className="text-fg">first, write every idea down</span>{" "}
        <span className="rounded bg-keep-soft px-1 text-keep">✓ kept</span>
      </p>
    </div>
  );
}

export function HandoffVisual() {
  return (
    <ul aria-hidden="true" className="grid gap-2">
      {features.handoff.files.map((file) => (
        <li
          key={file}
          className="flex items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-2 font-mono text-[0.68rem] text-fg"
        >
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-accent" fill="none">
            <path d="M3 1.5h6.5L13 5v9.5H3z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="truncate">{file}</span>
        </li>
      ))}
    </ul>
  );
}

export function CaptionsVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-video overflow-hidden rounded-lg border border-line bg-[radial-gradient(120%_90%_at_30%_20%,rgb(255_90_31/0.25),transparent_60%),linear-gradient(160deg,#2a2622,#0f0e0d)]"
    >
      <span className="absolute top-2 left-2 font-mono text-[0.6rem] text-white/70">
        {features.captions.timecode}
      </span>
      <span className="absolute inset-x-3 bottom-3 mx-auto w-fit rounded bg-black/80 px-2 py-1 text-center text-[0.72rem] leading-snug text-white">
        {features.captions.sample}
      </span>
    </div>
  );
}

export function ChaptersVisual() {
  return (
    <ol aria-hidden="true" className="space-y-1.5">
      {features.chapters.sample.map((chapter) => (
        <li key={chapter.time} className="flex gap-3 text-[0.8rem]">
          <span className="font-mono text-accent tabular-nums">{chapter.time}</span>
          <span className="text-fg">{chapter.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function ThumbnailsVisual() {
  const backgrounds = [
    "linear-gradient(135deg,#ff5a1f,#7a1d05)",
    "linear-gradient(135deg,#2b2925,#55504a)",
    "linear-gradient(135deg,#7ee0b5,#1f5c46)",
  ];
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-2">
      {features.thumbnails.sample.map((text, index) => (
        <div
          key={text}
          style={{ background: backgrounds[index] }}
          className="flex aspect-video items-end rounded-md p-1.5"
        >
          <span className="display text-[0.6rem] leading-tight font-bold text-white uppercase sm:text-[0.68rem]">
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ReviewVisual() {
  const { comment, reply } = features.review;
  return (
    <div aria-hidden="true" className="space-y-2.5 text-[0.8rem]">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-keep-soft font-mono text-[0.6rem] text-keep">
          ED
        </span>
        <p className="rounded-xl rounded-tl-sm bg-panel px-3 py-2 text-fg">
          <span className="label-mono block text-faint">{comment.role} · 00:23</span>
          {comment.text}
        </p>
      </div>
      <div className="flex items-start justify-end gap-2.5">
        <p className="rounded-xl rounded-tr-sm bg-accent-soft px-3 py-2 text-fg">
          <span className="label-mono block text-faint">{reply.role}</span>
          {reply.text}
        </p>
      </div>
    </div>
  );
}
