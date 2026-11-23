import type { ReactNode } from "react";
import { hero, howItWorks } from "@/content/home";
import { HandoffVisual, RoughCutVisual } from "./feature-visuals";
import { CheckIcon } from "./icons";
import { SectionIntro } from "./section-intro";
import { container } from "./styles";

/*
 * How it works, shown rather than told: four steps, each with a small picture of the planned
 * product (drawn in code, labelled as an illustration) and one short line. On large screens a
 * rail with the step numbers draws itself as the steps come into view (CSS scroll timeline,
 * globals.css); the upload bar in step 1 fills the same way. Nothing loops, and without motion
 * everything is simply shown complete.
 */

/** A 24 px line glyph in the UI icons' style (icons.tsx). */
function Glyph({ className = "size-5", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Two lanes: the video file stays on the creator's drive; only its sound travels. */
function UploadPicture() {
  const words = howItWorks.upload;
  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl bg-bg p-3 shadow-soft">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-panel text-muted">
          <Glyph>
            <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
            <path d="M8 5v14M16 5v14" />
          </Glyph>
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.72rem] text-fg">{words.file}</p>
          <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-muted">
            <Glyph className="size-3.5">
              <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
              <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            </Glyph>
            {words.staysLocal}
          </p>
        </div>
      </div>

      {/* Only the sound leaves: a dashed line from the file, labelled. */}
      <div className="flex items-center gap-3 px-3">
        <span className="flex w-9 shrink-0 justify-center">
          <span className="h-8 border-s-2 border-dashed border-line-strong" />
        </span>
        <span className="detail rounded-full bg-keep-soft px-2 py-0.5 text-[0.5625rem] text-keep">
          {words.audioOnly}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-bg p-3 shadow-soft">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Glyph>
            <path d="M4 10.5v3M8 7.5v9M12 9.5v5M16 6v12M20 10.5v3" />
          </Glyph>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8rem] font-semibold text-fg">{words.destination}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel">
            <div className="draw-on-view h-full rounded-full bg-brand" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewPicture() {
  const words = howItWorks.review;
  return (
    <div className="space-y-2.5 text-[0.8rem]">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-keep-soft font-mono text-[0.6rem] text-keep">
          ED
        </span>
        <p className="rounded-xl rounded-tl-sm bg-bg px-3 py-2 shadow-soft">
          <span className="label-mono block text-faint">{words.who}</span>
          {words.comment}
        </p>
      </div>
      <div className="flex justify-end">
        <p className="rounded-xl rounded-tr-sm bg-ink px-3 py-2 text-on-ink">
          <span className="label-mono block opacity-70">{words.replyWho}</span>
          {words.reply}
        </p>
      </div>
      <p className="flex justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-keep-soft px-2.5 py-1 text-xs font-bold text-keep">
          <CheckIcon className="size-3.5" />
          {words.approved}
        </span>
      </p>
    </div>
  );
}

function ExportPicture() {
  return (
    <div className="space-y-3">
      <HandoffVisual />
      <p className="flex flex-wrap gap-1.5">
        {hero.apps.map((app) => (
          <span
            key={app}
            className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-muted shadow-soft"
          >
            {app}
          </span>
        ))}
      </p>
    </div>
  );
}

const pictures = [
  <UploadPicture key="upload" />,
  <div key="cuts" className="rounded-xl bg-bg p-3 shadow-soft">
    <RoughCutVisual />
  </div>,
  <ReviewPicture key="review" />,
  <ExportPicture key="export" />,
];

export function HowItWorks() {
  const { steps } = howItWorks;
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="bg-raised">
      <div className={`${container} py-20 sm:py-28 lg:py-32`}>
        <SectionIntro
          center
          id="how-heading"
          eyebrow={howItWorks.eyebrow}
          heading={howItWorks.heading}
        />

        {/* The rail: step numbers joined by a line that draws itself (large screens). */}
        <div aria-hidden="true" className="relative mt-14 hidden grid-cols-4 lg:grid">
          <div className="absolute inset-x-[12.5%] top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-line-strong">
            <div className="draw-on-view h-full rounded-full bg-brand" />
          </div>
          {steps.map((step, index) => (
            <span
              key={step.title}
              className="relative mx-auto flex size-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-on-ink ring-4 ring-raised"
            >
              {index + 1}
            </span>
          ))}
        </div>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="reveal flex flex-col rounded-[1.75rem] bg-bg p-2.5 shadow-soft"
            >
              <div
                aria-hidden="true"
                className="flex min-h-56 flex-col justify-center rounded-[1.25rem] bg-raised p-4 lg:h-64"
              >
                {pictures[index]}
              </div>
              <div className="px-3 pt-5 pb-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-on-ink lg:hidden">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-xl leading-snug font-bold lg:mt-0">{step.title}</h3>
                <p className="mt-1.5 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center text-sm text-faint">{howItWorks.note}</p>
      </div>
    </section>
  );
}
