import { illustration } from "@/content/home";

/**
 * A drawn example of the review screen, clearly labelled as an illustration (AGENTS.md: no
 * unlabelled mock-ups). Replace with a real demo video made from the founder's own footage.
 */
export function TranscriptIllustration() {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-1 shadow-xl shadow-black/5">
      <div className="flex items-center justify-between gap-3 rounded-t-xl border-b border-line px-4 py-3">
        <p className="text-sm font-semibold">{illustration.title}</p>
        <p className="text-xs text-muted">{illustration.summary}</p>
      </div>
      <ol className="space-y-3 px-4 py-5 text-[0.95rem] leading-relaxed">
        {illustration.lines.map((line) => (
          <li key={line.time} className="flex gap-4">
            <span className="w-11 shrink-0 pt-0.5 font-mono text-xs text-muted">{line.time}</span>
            <p>
              {line.parts.map((part) =>
                part.cut ? (
                  <del
                    key={part.text}
                    className="rounded bg-cut-soft px-1 text-cut decoration-2"
                    title={illustration.legendRemoved}
                  >
                    <span className="sr-only">{illustration.legendRemoved}: </span>
                    {part.text}
                  </del>
                ) : (
                  <span key={part.text}>{part.text}</span>
                ),
              )}
            </p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-4 py-3 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-sm bg-cut-soft ring-1 ring-cut"
          />
          {illustration.legendRemoved}
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-sm bg-surface-2 ring-1 ring-line"
          />
          {illustration.legendKept}
        </span>
      </div>
      <figcaption className="px-4 pb-3 text-xs italic text-muted">{illustration.label}</figcaption>
    </figure>
  );
}
