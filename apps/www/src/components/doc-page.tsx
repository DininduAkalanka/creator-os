import type { ReactNode } from "react";
import { DraftNotice } from "./notices";
import { container } from "./styles";

/** Layout for long text pages: privacy, terms, about. */
export function DocPage(props: {
  title: string;
  updated?: string;
  /** Legal texts show the draft notice until a lawyer has reviewed them. */
  legal?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`${container} max-w-3xl py-12 sm:py-16`}>
      <h1 className="text-4xl font-semibold tracking-tight">{props.title}</h1>
      {props.updated && <p className="mt-3 text-sm text-muted">{props.updated}</p>}
      {props.legal && (
        <div className="mt-6">
          <DraftNotice />
        </div>
      )}
      <div className="prose-doc mt-6">{props.children}</div>
    </article>
  );
}
