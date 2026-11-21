import type { ReactNode } from "react";

/** Section opener: a timecode-style index, an eyebrow, the heading and an optional lead. */
export function SectionIntro(props: {
  id: string;
  index: string;
  eyebrow: string;
  heading: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`reveal max-w-3xl ${props.className ?? ""}`}>
      <p className="label-mono flex items-center gap-3 text-faint">
        <span className="text-accent tabular-nums">{props.index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
        {props.eyebrow}
      </p>
      <h2
        id={props.id}
        className="display mt-5 text-4xl leading-[1.02] font-semibold text-balance sm:text-5xl lg:text-6xl"
      >
        {props.heading}
      </h2>
      {props.lead && <p className="mt-5 max-w-2xl text-lg text-pretty text-muted">{props.lead}</p>}
    </div>
  );
}
