import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CutDemo } from "@/components/cut-demo";
import {
  CaptionsVisual,
  ChaptersVisual,
  HandoffVisual,
  ProblemTimeline,
  ReviewVisual,
  RoughCutVisual,
  ThumbnailsVisual,
} from "@/components/feature-visuals";
import { CheckIcon, CrossIcon } from "@/components/icons";
import { SectionIntro } from "@/components/section-intro";
import { buttonLarge, buttonPrimary, buttonSecondary, card, container } from "@/components/styles";
import { WaitlistForm } from "@/components/waitlist-form";
import {
  audiences,
  dataHandling,
  faq,
  features,
  finalCta,
  foundingOffer,
  hero,
  problem,
  steps,
} from "@/content/home";

/** Stagger index for the load-in animation (globals.css .rise). */
const order = (index: number) => ({ "--i": index }) as CSSProperties;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Audiences />
      <FoundingOffer />
      <DataHandling />
      <Faq />
      <Waitlist />
    </>
  );
}

function Glow({ className }: { className: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute ${className}`} />;
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <Glow className="inset-0 bg-[radial-gradient(55%_45%_at_88%_8%,rgb(255_90_31/0.2),transparent_70%),radial-gradient(35%_35%_at_5%_95%,rgb(126_224_181/0.07),transparent_70%)]" />
      <div
        className={`${container} relative grid items-center gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-24 lg:pb-28`}
      >
        <div>
          <p
            style={order(0)}
            className="rise label-mono inline-flex items-center gap-2 rounded-full border border-line-strong bg-raised/60 px-3 py-1.5 text-muted"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {hero.eyebrow}
          </p>
          {/* Not animated: the headline is the largest paint, so it shows at once. */}
          <h1
            id="hero-heading"
            className="display mt-7 text-[clamp(2.75rem,5.6vw,4.9rem)] leading-[0.98] font-semibold text-balance"
          >
            <span className="sr-only">{hero.headline}</span>
            <span aria-hidden="true">
              {hero.headlineBefore} <span className="hero-cut">{hero.headlineCut}</span>{" "}
              {hero.headlineAfter}
            </span>
          </h1>
          <p
            style={order(2)}
            className="rise mt-7 max-w-xl text-lg text-pretty text-muted sm:text-xl"
          >
            {hero.lead}
          </p>
          <div style={order(3)} className="rise mt-9 flex flex-wrap items-center gap-3">
            <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge}`}>
              {hero.primaryCta}
              <Arrow />
            </Link>
            <Link href="#how-it-works" className={`${buttonSecondary} ${buttonLarge}`}>
              {hero.secondaryCta}
            </Link>
          </div>
          <p style={order(4)} className="rise mt-4 text-sm text-faint">
            {hero.status}
          </p>
          <div style={order(5)} className="rise mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="label-mono text-faint">{hero.exportsLabel}</span>
            {hero.apps.map((app) => (
              <span
                key={app}
                className="rounded-full border border-line px-3 py-1 text-sm text-muted"
              >
                {app}
              </span>
            ))}
          </div>
        </div>
        <div style={order(3)} className="rise">
          <CutDemo />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="border-t border-line">
      <div
        className={`${container} grid gap-14 py-24 sm:py-32 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20`}
      >
        <div>
          <SectionIntro
            id="problem-heading"
            index={problem.index}
            eyebrow={problem.eyebrow}
            heading={problem.heading}
            lead={problem.lead}
          />
          <ul className="mt-12 grid gap-7 sm:grid-cols-3 lg:grid-cols-1">
            {problem.points.map((point) => (
              <li key={point.title} className="reveal border-l-2 border-accent pl-5">
                <h3 className="font-semibold">{point.title}</h3>
                <p className="mt-1.5 text-muted">{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <ProblemTimeline />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-t border-line bg-raised"
    >
      <div className={`${container} py-24 sm:py-32`}>
        <SectionIntro
          id="how-heading"
          index={steps.index}
          eyebrow={steps.eyebrow}
          heading={steps.heading}
        />
        <ol className="relative mt-16 grid gap-12 before:absolute before:inset-x-0 before:top-[1.125rem] before:hidden before:h-px before:bg-line-strong lg:grid-cols-3 lg:gap-10 lg:before:block">
          {steps.items.map((step, index) => (
            <li key={step.title} className="reveal relative">
              <div className="flex items-center gap-3">
                <span className="label-mono relative flex h-9 items-center rounded-full border border-accent bg-raised px-3.5 text-accent">
                  {step.tag}
                </span>
                <span className="label-mono text-faint tabular-nums">0{index + 1}</span>
              </div>
              <h3 className="display mt-7 text-2xl leading-tight font-semibold sm:text-3xl">
                {step.title}
              </h3>
              <p className="mt-3 max-w-md text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FeatureCard(props: {
  title: string;
  body: string;
  visual: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`reveal flex flex-col gap-7 ${card} p-5 transition-colors hover:border-line-strong sm:p-6 ${props.className ?? ""}`}
    >
      <div className="flex min-h-36 flex-1 flex-col justify-center rounded-xl border border-line bg-bg/70 p-4 sm:p-5">
        {props.visual}
      </div>
      <div>
        <h3 className="display text-xl leading-tight font-semibold sm:text-2xl">{props.title}</h3>
        <p className="mt-2 text-muted">{props.body}</p>
      </div>
    </li>
  );
}

function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="border-t border-line">
      <div className={`${container} py-24 sm:py-32`}>
        <SectionIntro
          id="features-heading"
          index={features.index}
          eyebrow={features.eyebrow}
          heading={features.heading}
          lead={features.note}
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            className="md:col-span-2"
            {...features.roughCut}
            visual={<RoughCutVisual />}
          />
          <FeatureCard {...features.handoff} visual={<HandoffVisual />} />
          <FeatureCard {...features.captions} visual={<CaptionsVisual />} />
          <FeatureCard {...features.chapters} visual={<ChaptersVisual />} />
          <FeatureCard {...features.thumbnails} visual={<ThumbnailsVisual />} />
          <FeatureCard className="md:col-span-2" {...features.review} visual={<ReviewVisual />} />
          <li className={`reveal ${card} flex flex-col justify-center bg-transparent p-6`}>
            <h3 className="label-mono text-faint">{features.notList.heading}</h3>
            <ul className="mt-5 space-y-4">
              {features.notList.items.map((item) => (
                <li key={item} className="flex gap-3 text-muted">
                  <CrossIcon className="mt-0.5 size-5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section aria-labelledby="audiences-heading" className="theme-paper">
      <div className={`${container} py-24 sm:py-32`}>
        <SectionIntro
          id="audiences-heading"
          index={audiences.index}
          eyebrow={audiences.eyebrow}
          heading={audiences.heading}
          lead={audiences.lead}
        />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line lg:grid-cols-3">
          {audiences.items.map((audience, index) => (
            <li key={audience.title} className="reveal bg-raised p-7 sm:p-9">
              <span className="label-mono text-accent tabular-nums">0{index + 1}</span>
              <h3 className="display mt-8 text-2xl leading-tight font-semibold">
                {audience.title}
              </h3>
              <p className="mt-3 text-muted">{audience.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FoundingOffer() {
  return (
    <section id="offer" aria-labelledby="offer-heading" className="relative overflow-hidden">
      <Glow className="inset-0 bg-[radial-gradient(45%_55%_at_75%_50%,rgb(255_90_31/0.16),transparent_70%)]" />
      <div
        className={`${container} relative grid gap-14 py-24 sm:py-32 lg:grid-cols-2 lg:items-center lg:gap-20`}
      >
        <SectionIntro
          id="offer-heading"
          index={foundingOffer.index}
          eyebrow={foundingOffer.eyebrow}
          heading={foundingOffer.heading}
          lead={foundingOffer.disclaimer}
        />
        <div className="reveal relative mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-line-strong bg-panel">
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-line-strong px-7 py-4">
              <span className="label-mono text-accent">{foundingOffer.passLabel}</span>
              <span className="label-mono rounded-full border border-line-strong px-2.5 py-1 text-muted">
                {foundingOffer.badge}
              </span>
            </div>
            {/* Ticket notches on the perforation line. */}
            <span
              aria-hidden="true"
              className="absolute top-[2.65rem] -left-3 size-6 rounded-full bg-bg"
            />
            <span
              aria-hidden="true"
              className="absolute top-[2.65rem] -right-3 size-6 rounded-full bg-bg"
            />
            <div className="px-7 pt-7 pb-8">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-muted">{foundingOffer.planLabel}</p>
                <p className="label-mono text-faint">{foundingOffer.seats}</p>
              </div>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="display text-7xl font-semibold">{foundingOffer.price}</span>
                <span className="text-muted">{foundingOffer.pricePeriod}</span>
              </p>
              <ul className="mt-8 space-y-3.5">
                {foundingOffer.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <CheckIcon className="mt-0.5 size-5 shrink-0 text-keep" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge} mt-9 w-full`}>
                {foundingOffer.cta}
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataHandling() {
  return (
    <section aria-labelledby="data-heading" className="border-t border-line bg-raised">
      <div className={`${container} py-24 sm:py-32`}>
        <SectionIntro
          id="data-heading"
          index={dataHandling.index}
          eyebrow={dataHandling.eyebrow}
          heading={dataHandling.heading}
          lead={dataHandling.lead}
        />
        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {dataHandling.items.map((item, index) => (
            <li key={item.title} className={`reveal ${card} bg-bg p-7`}>
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-keep-soft font-mono text-sm text-keep"
              >
                {index + 1}
              </span>
              <h3 className="display mt-7 text-xl leading-tight font-semibold">{item.title}</h3>
              <p className="mt-3 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {dataHandling.privacyLink}
            <Arrow />
          </Link>
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="theme-paper">
      <div
        className={`${container} grid gap-12 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro
            id="faq-heading"
            index={faq.index}
            eyebrow={faq.eyebrow}
            heading={faq.heading}
          />
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faq.items.map((item) => (
            <details key={item.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-accent transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-heading" className="relative overflow-hidden">
      <Glow className="inset-0 bg-[radial-gradient(50%_60%_at_15%_20%,rgb(255_90_31/0.16),transparent_70%)]" />
      <div
        className={`${container} relative grid gap-12 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}
      >
        <div className="reveal">
          <h2
            id="waitlist-heading"
            className="display text-5xl leading-[0.98] font-semibold text-balance sm:text-6xl lg:text-7xl"
          >
            {finalCta.heading}
          </h2>
          <p className="mt-6 max-w-md text-lg text-pretty text-muted">{finalCta.lead}</p>
        </div>
        <div className={`reveal ${card} p-6 sm:p-8`}>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
