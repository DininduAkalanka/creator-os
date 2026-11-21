import type { ReactNode } from "react";

/**
 * Section opener: a timecode-style index, an eyebrow, the heading and an optional lead.
 * `center` gives the adobe.com look for big statement sections ("Explore what's new.").
 */
export function SectionIntro(props: {
  id: string;
  index: string;
  eyebrow: string;
  heading: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  const center = props.center ?? false;
  return (
    <div
      className={`reveal max-w-3xl ${center ? "mx-auto text-center" : ""} ${props.className ?? ""}`}
    >
      <p
        className={`label-mono flex items-center gap-3 text-faint ${center ? "justify-center" : ""}`}
      >
        <span className="text-accent tabular-nums">{props.index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
        {props.eyebrow}
      </p>
      <h2
        id={props.id}
        className="display mt-5 text-4xl leading-[1] font-extrabold tracking-[-0.042em] text-balance sm:text-5xl lg:text-[4.25rem]"
      >
        {props.heading}
      </h2>
      {props.lead && (
        <p
          className={`mt-6 max-w-2xl text-lg text-pretty text-muted sm:text-xl ${center ? "mx-auto" : ""}`}
        >
          {props.lead}
        </p>
      )}
    </div>
  );
}
