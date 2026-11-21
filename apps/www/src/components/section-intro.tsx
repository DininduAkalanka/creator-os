import type { ReactNode } from "react";

/**
 * Section opener in adobe.com's style: a short plain eyebrow ("Features and Releases" above
 * "Explore what's new."), a heavy heading and an optional lead. Sections are not numbered, as on
 * adobe.com. `center` is for the big statement sections.
 */
export function SectionIntro(props: {
  id: string;
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
      <p className="text-lg font-semibold text-muted">{props.eyebrow}</p>
      <h2
        id={props.id}
        className="display mt-3 text-[2.6rem] leading-[1.02] tracking-[-0.025em] text-balance sm:text-5xl lg:text-[4.25rem]"
      >
        {props.heading}
      </h2>
      {props.lead && (
        <p
          className={`mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted sm:text-xl ${center ? "mx-auto" : ""}`}
        >
          {props.lead}
        </p>
      )}
    </div>
  );
}
