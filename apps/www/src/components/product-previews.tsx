/**
 * Product previews drawn in code (no images): the Channel Audit and "what to film next".
 * Every number is example data and every preview says so. Pure components (no hooks), so they
 * render on the server and can also be used inside the hero carousel.
 *
 * The previews are visual: the same information is in the section text next to them, so the
 * drawn controls (feedback buttons, Accept/Dismiss) are aria-hidden and not focusable.
 */
import { audit, nextVideo } from "@/content/services";

/** Day-28 views for 12 example videos, relative to the channel's usual value (1 = usual). */
const EXAMPLE_VIEWS = [0.8, 1.1, 0.7, 1.3, 2.2, 0.9, 1.0, 1.9, 0.6, 1.2, 2.1, 1.0];
const BAND = { low: 0.75, high: 1.35 };
const MAX = 2.4;

function confidenceClass(level: string) {
  if (level === "High") return "bg-keep-soft text-keep";
  if (level === "Medium") return "bg-accent-soft text-accent";
  return "bg-panel text-muted";
}

function PreviewLabel({ text }: { text: string }) {
  return (
    <span className="label-mono rounded-full border border-line-strong px-2 py-1 text-[0.5625rem] text-faint">
      {text}
    </span>
  );
}

function BaselineChart({ compact = false }: { compact?: boolean }) {
  const width = 240;
  const height = compact ? 70 : 110;
  const slot = width / EXAMPLE_VIEWS.length;
  const y = (value: number) => height - (value / MAX) * height;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
      <rect
        x="0"
        y={y(BAND.high)}
        width={width}
        height={y(BAND.low) - y(BAND.high)}
        className="fill-fg/10"
      />
      <line x1="0" x2={width} y1={y(1)} y2={y(1)} className="stroke-fg/30" strokeDasharray="3 3" />
      {EXAMPLE_VIEWS.map((value, index) => (
        <rect
          key={index}
          x={index * slot + slot * 0.22}
          width={slot * 0.56}
          y={y(value)}
          height={height - y(value)}
          rx="1.5"
          className={
            value > BAND.high ? "fill-keep" : value < BAND.low ? "fill-accent" : "fill-fg/45"
          }
        />
      ))}
    </svg>
  );
}

/** Full Channel Audit preview for its section. */
export function AuditPreview() {
  const p = audit.preview;
  return (
    <figure
      aria-hidden="true"
      className="overflow-hidden rounded-[1.5rem] border border-line bg-bg shadow-lift"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="size-2 rounded-full bg-keep" />
          {p.title}
        </p>
        <PreviewLabel text={p.label} />
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-bg/60 p-4">
            <p className="label-mono text-faint">{p.profileTitle}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.8rem]">
              {p.profile.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-faint">{term}</dt>
                  <dd className="font-semibold text-fg">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex gap-2">
              {p.profileActions.map((action, index) => (
                <span
                  key={action}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    index === 0 ? "bg-ink text-on-ink" : "border border-line-strong text-fg"
                  }`}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-bg/60 p-4">
            <p className="label-mono text-faint">{p.chartTitle}</p>
            <div className="mt-3">
              <BaselineChart />
            </div>
            <p className="mt-2 text-[0.7rem] text-faint">{p.chartNote}</p>
          </div>
        </div>
        <div>
          <p className="label-mono text-faint">{p.insightsTitle}</p>
          <ul className="mt-3 space-y-3">
            {p.insights.map((insight) => (
              <li key={insight.title} className="rounded-xl border border-line bg-bg/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.9rem] leading-snug font-semibold text-fg">
                    {insight.title}
                  </p>
                  <span
                    className={`label-mono shrink-0 rounded-full px-2 py-1 text-[0.5625rem] ${confidenceClass(insight.confidence)}`}
                  >
                    {insight.confidence}
                  </span>
                </div>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">{insight.evidence}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.feedback.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] text-faint"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="border-t border-line bg-bg/40 px-5 py-2.5 text-xs text-faint italic">
        {p.disclaimer}
      </figcaption>
    </figure>
  );
}

/** Full "what to film next" preview for its section. */
export function NextVideoPreview() {
  const p = nextVideo.preview;
  return (
    <figure
      aria-hidden="true"
      className="overflow-hidden rounded-[1.5rem] border border-line bg-bg shadow-lift"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="label-mono text-accent">{p.kicker}</p>
        <PreviewLabel text={p.label} />
      </div>
      <div className="p-5 sm:p-6">
        <p className="display text-2xl leading-tight font-semibold text-balance sm:text-3xl">
          {p.title}
        </p>
        <p className="label-mono mt-6 text-faint">{p.why}</p>
        <ul className="mt-3 space-y-2.5">
          {p.reasons.map((reason) => (
            <li key={reason} className="flex gap-2.5 text-[0.85rem] text-muted">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-keep" />
              {reason}
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-line bg-bg/60 p-4 text-[0.8rem]">
          {p.details.map(([term, value]) => (
            <div key={term}>
              <dt className="text-faint">{term}</dt>
              <dd className="mt-0.5 font-semibold text-fg">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          {p.actions.map((action, index) => (
            <span
              key={action}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                index === 0 ? "bg-ink text-on-ink" : "border border-line-strong text-fg"
              }`}
            >
              {action}
            </span>
          ))}
        </div>
        <p className="mt-5 border-t border-dashed border-line-strong pt-4 text-[0.78rem] text-faint">
          {p.outcome}
        </p>
      </div>
      <figcaption className="border-t border-line bg-bg/40 px-5 py-2.5 text-xs text-faint italic">
        {p.disclaimer}
      </figcaption>
    </figure>
  );
}

/* ---------- Small floating versions for the hero slides ---------- */

// Dark glass, because these float over photos in the hero and on the service cards.
const miniCard =
  "theme-dark w-80 rounded-2xl border border-white/15 bg-[#0e0d1c]/85 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-md";

export function AuditMini() {
  const p = audit.preview;
  const insight = p.insights[0];
  return (
    <div aria-hidden="true" className={miniCard}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{p.title}</p>
        <PreviewLabel text={p.shortLabel} />
      </div>
      <div className="mt-3">
        <BaselineChart compact />
      </div>
      {insight && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
          <p className="text-[0.8rem] leading-snug font-semibold">{insight.title}</p>
          <p className="mt-1 text-[0.7rem] text-muted">{insight.evidence}</p>
        </div>
      )}
    </div>
  );
}

export function NextMini() {
  const p = nextVideo.preview;
  return (
    <div aria-hidden="true" className={miniCard}>
      <div className="flex items-center justify-between">
        <p className="label-mono text-accent">{p.kicker}</p>
        <PreviewLabel text={p.shortLabel} />
      </div>
      <p className="display mt-3 text-lg leading-tight font-bold">{p.title}</p>
      <p className="mt-2 text-[0.72rem] text-muted">{p.reasons[0]}</p>
      <div className="mt-3 flex gap-2">
        {p.actions.slice(0, 2).map((action, index) => (
          <span
            key={action}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              index === 0 ? "bg-white text-navy" : "border border-white/25"
            }`}
          >
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ReviewMini() {
  return (
    <div aria-hidden="true" className={`${miniCard} space-y-2.5`}>
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-keep-soft font-mono text-[0.6rem] text-keep">
          ED
        </span>
        <p className="rounded-xl rounded-tl-sm bg-white/10 px-3 py-2 text-[0.8rem]">
          <span className="label-mono block text-muted">Editor · 00:23</span>
          Keeping the second take here, it&apos;s tighter.
        </p>
      </div>
      <div className="flex justify-end">
        <p className="rounded-xl rounded-tr-sm bg-brand/25 px-3 py-2 text-[0.8rem]">
          <span className="label-mono block text-white/75">You</span>
          Agreed. Approved.
        </p>
      </div>
    </div>
  );
}
