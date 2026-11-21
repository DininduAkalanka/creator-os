import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import eveningBack from "@/assets/media/evening-back.jpg";
import footageLocal from "@/assets/media/footage-stays-local.jpg";
import nightEdit from "@/assets/media/night-edit.jpg";
import personaCreator from "@/assets/media/persona-creator.jpg";
import personaEditor from "@/assets/media/persona-editor.jpg";
import personaEducator from "@/assets/media/persona-educator.jpg";
import reviewTogether from "@/assets/media/review-together.jpg";
import talkingPoster from "@/assets/media/talking-poster.jpg";
import timelineDetail from "@/assets/media/timeline-detail.jpg";
import {
  ChaptersVisual,
  HandoffVisual,
  LocalFootageVisual,
  RoughCutVisual,
  ThumbnailsVisual,
} from "@/components/feature-visuals";
import { HeroCarousel } from "@/components/hero-carousel";
import { CheckIcon, CrossIcon } from "@/components/icons";
import { LazyCutDemo } from "@/components/lazy-cut-demo";
import { AiCredit, Photo, VideoPanel } from "@/components/media";
import { AuditMini, AuditPreview, NextMini, NextVideoPreview } from "@/components/product-previews";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionIntro } from "@/components/section-intro";
import { StoryCarousel } from "@/components/story-carousel";
import { buttonLarge, buttonPrimary, card, container } from "@/components/styles";
import { WaitlistForm } from "@/components/waitlist-form";
import { faq, features, finalCta, story, tryIt } from "@/content/home";
import {
  audit,
  nextVideo,
  plans,
  roadmap,
  services,
  statusLabels,
  stories,
  type ServiceStatus,
} from "@/content/services";

const storyPhotos: Record<string, StaticImageData> = {
  creator: personaCreator,
  educator: personaEducator,
  editor: personaEditor,
};

/**
 * Section order follows the product loop. Loading follows adobe.com: the hero's first slide is
 * the only eager media; everything below is lazy (images on approach, demo code on approach).
 * Motion follows adobe.com too: `.reveal` content rises in on scroll (ScrollReveal) and large
 * media `.settle` into place (CSS scroll timeline). Both are off for reduced motion.
 */
export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <HeroCarousel />
      <Services />
      <Story />
      <TryIt />
      <Features />
      <AuditSection />
      <NextVideoSection />
      <Roadmap />
      <Stories />
      <Plans />
      <Faq />
      <Waitlist />
    </>
  );
}

function StatusPill({ status, className = "" }: { status: ServiceStatus; className?: string }) {
  const tone =
    status === "first"
      ? "border-keep/50 text-keep"
      : status === "beta"
        ? "border-accent/50 text-accent"
        : "border-line-strong text-faint";
  return (
    <span
      className={`label-mono rounded-full border px-2 py-0.5 text-[0.5625rem] ${tone} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
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

function Story() {
  return (
    <section id="how-it-works" aria-labelledby="story-heading" className="border-t border-line">
      <div className={`${container} py-24 sm:py-32`}>
        <SectionIntro
          id="story-heading"
          index={story.index}
          eyebrow={story.eyebrow}
          heading={story.heading}
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <article className={`reveal ${card} overflow-hidden`}>
            <Photo
              src={nightEdit}
              alt={story.before.imageAlt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/9] rounded-none border-0"
            />
            <div className="p-6 sm:p-8">
              <p className="label-mono text-faint">{story.before.label}</p>
              <h3 className="display mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
                {story.before.title}
              </h3>
              <ol className="mt-6 space-y-4">
                {story.before.beats.map((beat) => (
                  <li key={beat.time} className="grid grid-cols-[5.5rem_1fr] gap-3">
                    <span className="font-mono text-sm text-faint tabular-nums">{beat.time}</span>
                    <span className="text-muted">{beat.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          <article
            className={`reveal ${card} overflow-hidden border-accent/40 shadow-[0_30px_80px_-40px_rgb(255_90_31/0.45)]`}
          >
            <Photo
              src={eveningBack}
              alt={story.after.imageAlt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/9] rounded-none border-0"
            />
            <div className="p-6 sm:p-8">
              <p className="label-mono text-accent">{story.after.label}</p>
              <h3 className="display mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
                {story.after.title}
              </h3>
              <ol className="mt-6 space-y-4">
                {story.after.beats.map((beat) => (
                  <li key={beat.tag} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
                    <span className="label-mono w-fit rounded-full border border-accent px-2.5 py-1 text-accent">
                      {beat.tag}
                    </span>
                    <span className="text-fg">{beat.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </div>
        <p className="mt-5 text-sm text-faint italic">{story.note}</p>
      </div>
    </section>
  );
}

function TryIt() {
  return (
    <section
      id="try-it"
      aria-labelledby="try-heading"
      className="relative overflow-hidden border-t border-line bg-raised"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_80%_40%,rgb(255_90_31/0.14),transparent_70%)]"
      />
      <div
        className={`${container} relative grid items-center gap-14 py-24 sm:py-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16`}
      >
        <div>
          <SectionIntro
            id="try-heading"
            index={tryIt.index}
            eyebrow={tryIt.eyebrow}
            heading={tryIt.heading}
            lead={tryIt.lead}
          />
          <ul className="mt-8 space-y-3">
            {tryIt.points.map((point) => (
              <li key={point} className="reveal flex gap-3 text-muted">
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-keep" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal">
          <LazyCutDemo />
        </div>
      </div>
    </section>
  );
}

function FeatureBlock(props: {
  index: number;
  total: number;
  title: string;
  body: string;
  media: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={`reveal ${props.flip ? "lg:order-2" : ""}`}>
        <div className="settle">{props.media}</div>
      </div>
      <div className={`reveal ${props.flip ? "lg:order-1" : ""}`}>
        <p className="label-mono text-faint tabular-nums">
          <span className="text-accent">0{props.index}</span> / 0{props.total}
        </p>
        <h3 className="display mt-4 text-3xl leading-[1.05] font-semibold text-balance sm:text-4xl lg:text-5xl">
          {props.title}
        </h3>
        <p className="mt-5 max-w-lg text-lg text-pretty text-muted">{props.body}</p>
      </div>
    </div>
  );
}

function Features() {
  const { blocks } = features;
  const half = "(min-width: 1024px) 50vw, 100vw";
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
        <div className="mt-16 space-y-24 lg:space-y-32">
          <FeatureBlock
            index={1}
            total={4}
            title={blocks.roughCut.title}
            body={blocks.roughCut.body}
            media={
              <Photo
                src={timelineDetail}
                alt={blocks.roughCut.imageAlt}
                sizes={half}
                className="aspect-[4/3]"
                overlay={<RoughCutVisual />}
              />
            }
          />
          <FeatureBlock
            flip
            index={2}
            total={4}
            title={blocks.captions.title}
            body={blocks.captions.body}
            media={
              <VideoPanel
                poster={talkingPoster}
                src="/videos/talking-loop.mp4"
                sizes={half}
                className="aspect-[4/3] sm:aspect-video"
              >
                <span className="pointer-events-none absolute top-3 right-3 font-mono text-[0.65rem] text-white/75">
                  {blocks.captions.timecode}
                </span>
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-16 mx-auto w-fit max-w-[85%] rounded-md bg-black/80 px-3 py-1.5 text-center text-sm text-white sm:text-base"
                >
                  {blocks.captions.lines[1]}
                </p>
              </VideoPanel>
            }
          />
          <FeatureBlock
            index={3}
            total={4}
            title={blocks.handoff.title}
            body={blocks.handoff.body}
            media={
              <Photo
                src={reviewTogether}
                alt={blocks.handoff.imageAlt}
                sizes={half}
                className="aspect-[4/3]"
                overlay={<HandoffVisual />}
                overlayClassName="right-4 bottom-4 w-56"
              />
            }
          />
          <FeatureBlock
            flip
            index={4}
            total={4}
            title={blocks.local.title}
            body={blocks.local.body}
            media={
              <Photo
                src={footageLocal}
                alt={blocks.local.imageAlt}
                sizes={half}
                className="aspect-[4/3]"
                overlay={<LocalFootageVisual />}
                overlayClassName="right-4 bottom-4 left-4 sm:left-auto sm:w-72"
              />
            }
          />
        </div>

        <h3 className="label-mono mt-28 text-faint">{features.extrasHeading}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          <li className={`reveal ${card} flex flex-col gap-6 p-6`}>
            <div className="rounded-xl border border-line bg-bg/70 p-4">
              <ChaptersVisual />
            </div>
            <div>
              <h4 className="display text-xl font-semibold">{features.chapters.title}</h4>
              <p className="mt-2 text-muted">{features.chapters.body}</p>
            </div>
          </li>
          <li className={`reveal ${card} flex flex-col gap-6 p-6`}>
            <div className="rounded-xl border border-line bg-bg/70 p-4">
              <ThumbnailsVisual />
            </div>
            <div>
              <h4 className="display text-xl font-semibold">{features.thumbnails.title}</h4>
              <p className="mt-2 text-muted">{features.thumbnails.body}</p>
            </div>
          </li>
          <li className={`reveal ${card} flex flex-col justify-center bg-transparent p-6`}>
            <h4 className="label-mono text-faint">{features.notList.heading}</h4>
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

/** Adobe-style "Everything you need" rail, on a rounded sheet that slides over the hero. */
function Services() {
  const visuals: Record<string, ReactNode> = {
    "rough-cut": <CardPhoto src={timelineDetail} alt="" />,
    captions: <CardPhoto src={talkingPoster} alt="" />,
    export: <CardPhoto src={footageLocal} alt="" />,
    review: <CardPhoto src={reviewTogether} alt="" />,
    audit: (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgb(126_224_181/0.18),transparent_60%),#0f0e0d] p-4">
        <div className="origin-center scale-[0.82]">
          <AuditMini />
        </div>
      </div>
    ),
    next: (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_70%_20%,rgb(255_90_31/0.22),transparent_60%),#0f0e0d] p-4">
        <div className="origin-center scale-[0.82]">
          <NextMini />
        </div>
      </div>
    ),
  };
  return (
    <section
      id="product"
      aria-labelledby="services-heading"
      className="relative z-10 -mt-6 rounded-t-[2rem] border-t border-line-strong bg-bg shadow-[0_-30px_60px_-20px_rgb(0_0_0/0.6)]"
    >
      <div className={`${container} py-24 sm:py-28`}>
        <SectionIntro
          id="services-heading"
          index={services.index}
          eyebrow={services.eyebrow}
          heading={services.heading}
          lead={services.lead}
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.cards.map((item) => (
            <li key={item.id} className="reveal">
              <Link
                href={item.href}
                className={`${card} group flex h-full flex-col overflow-hidden transition-colors hover:border-line-strong`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <StatusPill status={item.status} />
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">{visuals[item.id]}</div>
                <p className="px-5 py-4 text-sm text-muted">
                  {item.body}{" "}
                  <span
                    aria-hidden="true"
                    className="text-accent transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="reveal mt-14 rounded-[var(--radius)] border border-line bg-raised p-6">
          <h3 className="label-mono text-faint">{services.loopHeading}</h3>
          <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3">
            {services.loop.map((stage, index) => (
              <li key={stage.step} className="flex items-center gap-2">
                <span className="flex flex-col items-start gap-1 rounded-xl border border-line bg-bg px-3.5 py-2.5">
                  <span className="text-sm font-semibold">{stage.step}</span>
                  {stage.status ? (
                    <StatusPill status={stage.status} />
                  ) : (
                    <span className="label-mono text-[0.5625rem] text-faint">You</span>
                  )}
                </span>
                {index < services.loop.length - 1 && (
                  <span aria-hidden="true" className="text-faint">
                    →
                  </span>
                )}
              </li>
            ))}
            <li aria-hidden="true" className="text-accent">
              ↺
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function CardPhoto({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <AiCredit className="absolute top-3 left-3" />
    </>
  );
}

function AuditSection() {
  return (
    <section
      id="channel-audit"
      aria-labelledby="audit-heading"
      className="relative overflow-hidden border-t border-line bg-raised"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_50%_at_85%_30%,rgb(126_224_181/0.10),transparent_70%)]"
      />
      <div
        className={`${container} relative grid gap-14 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}
      >
        <div>
          <SectionIntro
            id="audit-heading"
            index={audit.index}
            eyebrow={audit.eyebrow}
            heading={audit.heading}
            lead={audit.lead}
          />
          <ol className="mt-10 space-y-6">
            {audit.steps.map((step, index) => (
              <li key={step.title} className="reveal grid grid-cols-[2.25rem_1fr] gap-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-keep-soft font-mono text-sm text-keep">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 font-semibold text-keep">{audit.free}</p>
          <ul className="mt-6 space-y-2.5">
            {audit.notItems.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted">
                <CrossIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal lg:pt-24">
          <AuditPreview />
        </div>
      </div>
    </section>
  );
}

function NextVideoSection() {
  return (
    <section id="next-video" aria-labelledby="next-heading" className="border-t border-line">
      <div
        className={`${container} grid gap-14 py-24 sm:py-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16`}
      >
        <div className="reveal order-2 lg:order-1">
          <NextVideoPreview />
        </div>
        <div className="order-1 lg:order-2">
          <SectionIntro
            id="next-heading"
            index={nextVideo.index}
            eyebrow={nextVideo.eyebrow}
            heading={nextVideo.heading}
            lead={nextVideo.lead}
          />
          <ul className="mt-8 space-y-3">
            {nextVideo.points.map((point) => (
              <li key={point} className="reveal flex gap-3 text-muted">
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-keep" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section
      id="roadmap"
      aria-labelledby="roadmap-heading"
      className="border-t border-line bg-raised"
    >
      <div className={`${container} py-24 sm:py-28`}>
        <SectionIntro
          id="roadmap-heading"
          index={roadmap.index}
          eyebrow={roadmap.eyebrow}
          heading={roadmap.heading}
          lead={roadmap.lead}
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.items.map((item) => (
            <li key={item.title} className={`reveal ${card} border-dashed bg-bg p-6`}>
              <StatusPill status="later" />
              <h3 className="display mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stories() {
  return (
    // overflow-x-clip: the slider settles from slightly wider than the page; clip, not hidden, so
    // the page (not this section) stays the scroll timeline.
    <section
      aria-labelledby="stories-heading"
      className="overflow-x-clip border-t border-line py-24 sm:py-28"
    >
      <div className={container}>
        <p className="label-mono flex items-center gap-3 text-faint">
          <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
          <span id="stories-heading">{stories.label}</span>
        </p>
      </div>
      {/* Full width, edge to edge (adobe.com): the neighbours peek in from the screen's edges. */}
      <div className="settle mt-8">
        <StoryCarousel images={storyPhotos} />
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="plans" aria-labelledby="plans-heading" className="theme-paper">
      <div className={`${container} py-24 sm:py-32`}>
        <SectionIntro
          id="plans-heading"
          index={plans.index}
          eyebrow={plans.eyebrow}
          heading={plans.heading}
          lead={plans.lead}
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.items.map((plan) => (
            <li
              key={plan.name}
              className={`reveal relative flex flex-col overflow-hidden rounded-[1.25rem] border p-6 ${
                plan.founding
                  ? "border-accent bg-raised shadow-[0_30px_70px_-35px_rgb(176_57_10/0.5)]"
                  : "border-line bg-raised"
              }`}
            >
              {plan.founding && (
                <span className="label-mono absolute top-0 right-0 rounded-bl-xl bg-accent px-3 py-1.5 text-[0.5625rem] text-on-accent">
                  {plans.founding.badge}
                </span>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="display text-5xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted">{plans.perMonth}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-accent">
                {plans.footage(plan.footage)}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-dashed border-line-strong pt-5">
                {plan.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-keep" />
                    {point}
                  </li>
                ))}
              </ul>
              {plan.founding && <p className="mt-5 text-xs text-muted">{plans.founding.note}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-1.5 text-sm text-muted">
            <p>{plans.sameFeatures}</p>
            <p>{plans.extra}</p>
            <p>{plans.disclaimer}</p>
          </div>
          <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge} shrink-0`}>
            {plans.cta}
          </Link>
        </div>
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
            lead={faq.lead}
          />
          <p className="mt-6">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              {faq.privacyLink}
              <Arrow />
            </Link>
          </p>
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
    <section
      id="waitlist"
      aria-labelledby="waitlist-heading"
      className="relative isolate overflow-hidden"
    >
      <Image
        src={eveningBack}
        alt=""
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(12_11_10/0.96)_30%,rgb(12_11_10/0.82)_60%,rgb(12_11_10/0.7)_100%)]"
      />
      <div
        className={`${container} grid gap-12 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}
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
        <div className={`reveal ${card} bg-raised/95 p-6 backdrop-blur sm:p-8`}>
          <WaitlistForm />
        </div>
      </div>
      <AiCredit className="absolute right-4 bottom-4" />
    </section>
  );
}
