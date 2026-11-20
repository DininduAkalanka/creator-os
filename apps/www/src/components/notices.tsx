import { BRAND, COMPANY, FEATURES } from "@/config/site";
import { siteCopy } from "@/content/site";
import { launchBlockers } from "@/lib/launch";
import { container } from "./styles";

/** Top-of-page notice on every page until every launch item is done. */
export function PreviewNotice() {
  const blockers = launchBlockers(BRAND, COMPANY, FEATURES);
  if (blockers.length === 0) return null;
  return (
    <aside aria-label={siteCopy.preview.label} className="bg-ink text-bg">
      <div className={`${container} py-2 text-sm`}>
        <details>
          <summary className="cursor-pointer">
            <strong className="font-semibold">{siteCopy.preview.lead}</strong>{" "}
            {siteCopy.preview.summary(blockers.length)}
          </summary>
          <ul className="mt-2 list-disc space-y-1 pb-1 ps-5">
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
    <div role="note" className="rounded-xl border border-accent bg-accent-soft p-4 text-sm">
      <strong className="font-semibold">{siteCopy.draft.heading}:</strong> {siteCopy.draft.body}
    </div>
  );
}
