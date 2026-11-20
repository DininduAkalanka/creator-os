import Link from "next/link";
import type { ReactNode } from "react";
import { CheckIcon, CrossIcon } from "@/components/icons";
import { buttonPrimary, buttonSecondary, card, container } from "@/components/styles";
import { TranscriptIllustration } from "@/components/transcript-illustration";
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

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
      {children}
    </h2>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="overflow-hidden">
      <div className={`${container} grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2`}>
        <div>
          <p className="text-sm font-semibold text-accent">{hero.eyebrow}</p>
          <h1
            id="hero-heading"
            className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {hero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-muted">{hero.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#waitlist" className={`${buttonPrimary} px-6 py-3 text-base`}>
              {hero.primaryCta}
            </Link>
            <Link href="#how-it-works" className={`${buttonSecondary} px-6 py-3 text-base`}>
              {hero.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">{hero.status}</p>
        </div>
        <TranscriptIllustration />
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="border-y border-line bg-surface">
      <div className={`${container} py-16 sm:py-20`}>
        <div className="max-w-2xl">
          <SectionHeading id="problem-heading">{problem.heading}</SectionHeading>
          <p className="mt-4 text-lg text-pretty text-muted">{problem.lead}</p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {problem.points.map((point) => (
            <li key={point.title} className="border-t-2 border-accent pt-4">
              <h3 className="font-semibold">{point.title}</h3>
              <p className="mt-2 text-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading">
      <div className={`${container} py-16 sm:py-24`}>
        <SectionHeading id="how-heading">{steps.heading}</SectionHeading>
        <ol className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.items.map((step, index) => (
            <li key={step.title} className={`${card} p-6`}>
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section aria-labelledby="features-heading" className="border-y border-line bg-surface">
      <div className={`${container} py-16 sm:py-24`}>
        <SectionHeading id="features-heading">{features.heading}</SectionHeading>
        <p className="mt-3 text-muted">{features.note}</p>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((feature) => (
            <li key={feature.title} className="flex gap-3">
              <CheckIcon className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-muted">{feature.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 rounded-2xl bg-surface-2 p-6">
          <h3 className="font-semibold">{features.notList.heading}</h3>
          <ul className="mt-3 space-y-2">
            {features.notList.items.map((item) => (
              <li key={item} className="flex gap-3 text-muted">
                <CrossIcon className="mt-0.5 size-5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section aria-labelledby="audiences-heading">
      <div className={`${container} py-16 sm:py-24`}>
        <div className="max-w-2xl">
          <SectionHeading id="audiences-heading">{audiences.heading}</SectionHeading>
          <p className="mt-4 text-lg text-pretty text-muted">{audiences.lead}</p>
        </div>
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {audiences.items.map((audience) => (
            <li key={audience.title} className={`${card} p-6`}>
              <h3 className="text-lg font-semibold">{audience.title}</h3>
              <p className="mt-2 text-muted">{audience.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FoundingOffer() {
  return (
    <section id="offer" aria-labelledby="offer-heading" className="border-y border-line bg-surface">
      <div className={`${container} grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center`}>
        <div>
          <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            {foundingOffer.badge}
          </p>
          <div className="mt-4">
            <SectionHeading id="offer-heading">{foundingOffer.heading}</SectionHeading>
          </div>
          <p className="mt-4 max-w-lg text-pretty text-muted">{foundingOffer.disclaimer}</p>
        </div>
        <div className={`${card} bg-bg p-8`}>
          <p className="font-semibold">{foundingOffer.planLabel}</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight">{foundingOffer.price}</span>
            <span className="text-muted">{foundingOffer.pricePeriod}</span>
          </p>
          <ul className="mt-6 space-y-3">
            {foundingOffer.points.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-accent" />
                {point}
              </li>
            ))}
          </ul>
          <Link href="#waitlist" className={`${buttonPrimary} mt-8 w-full py-3 text-base`}>
            {foundingOffer.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

function DataHandling() {
  return (
    <section aria-labelledby="data-heading">
      <div className={`${container} py-16 sm:py-24`}>
        <div className="max-w-2xl">
          <SectionHeading id="data-heading">{dataHandling.heading}</SectionHeading>
          <p className="mt-4 text-lg text-pretty text-muted">{dataHandling.lead}</p>
        </div>
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {dataHandling.items.map((item) => (
            <li key={item.title} className={`${card} p-6`}>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/privacy" className="text-accent underline underline-offset-2">
            {dataHandling.privacyLink}
          </Link>
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="border-y border-line bg-surface">
      <div className={`${container} max-w-3xl py-16 sm:py-24`}>
        <SectionHeading id="faq-heading">{faq.heading}</SectionHeading>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faq.items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="text-xl leading-none text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-heading">
      <div className={`${container} max-w-3xl py-16 sm:py-24`}>
        <SectionHeading id="waitlist-heading">{finalCta.heading}</SectionHeading>
        <p className="mt-4 text-lg text-pretty text-muted">{finalCta.lead}</p>
        <div className={`${card} mt-8 p-6 sm:p-8`}>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
