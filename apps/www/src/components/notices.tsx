import { BRAND, COMPANY, FEATURES } from "@/config/site";
import { siteCopy } from "@/content/site";
import { launchBlockers } from "@/lib/launch";
import { container } from "./styles";

/**
 * Top-of-page notice on every page until every launch item is done. Styled as a calm
 * announcement bar (v7), not an alert: it is a fact about the site, not an error.
 */
export function PreviewNotice() {
  const blockers = launchBlockers(BRAND, COMPANY, FEATURES);
  if (blockers.length === 0) return null;
  return (
    <aside aria-label={siteCopy.preview.label} className="border-b border-line bg-raised">
      <div className={`${container} py-2 text-center text-xs`}>
        <details>
          <summary className="cursor-pointer text-muted">
            <span className="me-1.5 rounded-full bg-bg px-2 py-0.5 font-semibold text-fg ring-1 ring-line">
              {siteCopy.preview.badge}
            </span>
            {siteCopy.preview.lead}{" "}
            <span className="text-faint">{siteCopy.preview.summary(blockers.length)}</span>
          </summary>
          <ul className="mx-auto mt-2 w-fit list-disc space-y-1 ps-5 pb-1 text-start text-muted">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </details>
      </div>
    </aside>
  );
}

/** Shown on legal pages until a lawyer has reviewed them. */
export function DraftNotice() {
  if (COMPANY.legalTextsReviewed) return null;
  return (
    <div role="note" className="rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm">
      <strong className="font-semibold">{siteCopy.draft.heading}:</strong> {siteCopy.draft.body}
    </div>
  );
}
