import type { ReactNode } from "react";
import { DraftNotice } from "./notices";
import { container } from "./styles";

/** Layout for long text pages (privacy, terms, about): warm paper theme for comfortable reading. */
export function DocPage(props: {
  eyebrow?: string;
  title: string;
  updated?: string;
  /** Legal texts show the draft notice until a lawyer has reviewed them. */
  legal?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="theme-paper">
      <article className={`${container} max-w-3xl py-16 sm:py-24`}>
        {props.eyebrow && <p className="label-mono text-accent">{props.eyebrow}</p>}
        <h1 className="display mt-4 text-5xl leading-[1.02] font-semibold sm:text-6xl">
          {props.title}
        </h1>
        {props.updated && <p className="label-mono mt-5 text-faint">{props.updated}</p>}
        {props.legal && (
          <div className="mt-8">
            <DraftNotice />
          </div>
        )}
        <div className="prose-doc mt-8">{props.children}</div>
      </article>
    </div>
  );
}
