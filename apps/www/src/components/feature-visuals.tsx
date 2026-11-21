/**
 * Small UI illustrations layered over the photos and used in the extras cards. Pure HTML/SVG and
 * CSS: nothing to download. Decorative (aria-hidden): each card's text says the same thing.
 */
import { features } from "@/content/home";

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
      {features.blocks.handoff.files.map((file) => (
        <li
          key={file}
          className="flex items-center gap-2 rounded-lg border border-line bg-panel/90 px-2.5 py-2 font-mono text-[0.68rem] text-fg"
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

export function LocalFootageVisual() {
  const local = features.blocks.local;
  return (
    <div aria-hidden="true" className="grid gap-2 text-[0.78rem]">
      <p className="flex items-center gap-2.5 rounded-lg border border-line bg-panel/90 px-3 py-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-keep-soft text-keep">
          ●
        </span>
        <span>
          <span className="font-semibold text-fg">{local.stays}</span>{" "}
          <span className="text-muted">{local.staysNote}</span>
        </span>
      </p>
      <p className="flex items-center gap-2.5 rounded-lg border border-line bg-panel/90 px-3 py-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-accent">
          ↑
        </span>
        <span>
          <span className="font-semibold text-fg">{local.goes}</span>{" "}
          <span className="text-muted">{local.goesNote}</span>
        </span>
      </p>
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
