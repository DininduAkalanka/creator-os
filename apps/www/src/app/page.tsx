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
  CutStripVisual,
  HandoffVisual,
  LocalFootageVisual,
  RoughCutVisual,
  ThumbnailsVisual,
} from "@/components/feature-visuals";
import { HeroCarousel } from "@/components/hero-carousel";
import { ArrowRightIcon, CheckIcon, CrossIcon, LoopIcon, PlusIcon } from "@/components/icons";
import { LazyCutDemo } from "@/components/lazy-cut-demo";
import { AiCredit, Photo, VideoPanel } from "@/components/media";
import {
  AuditMiniBody,
  AuditPreview,
  NextMiniBody,
  NextVideoPreview,
  ReviewThread,
} from "@/components/product-previews";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionIntro } from "@/components/section-intro";
import { ServiceIcon } from "@/components/service-icon";
import { ServiceSwitcher } from "@/components/service-switcher";
import { StoryCarousel } from "@/components/story-carousel";
import { buttonLarge, buttonPrimary, container } from "@/components/styles";
import { WaitlistForm } from "@/components/waitlist-form";
import { faq, features, finalCta, hero, story, tryIt } from "@/content/home";
import {
  audit,
  laterIcons,
  nextVideo,
  plans,
  roadmap,
  serviceIcons,
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
 * v6 (light first, adobe.com's homepage rhythm): white sections with light-grey bands, product
 * screens and highlight cards where they help, and a dark ending (the "Later" band, the
 * waitlist, the footer). Section order follows the product loop; what comes after the beta sits
 * just before the sign-up.
 *
 * Loading follows adobe.com: the hero's first slide is the only eager media; everything below is
 * lazy (images on approach, demo code on approach). Motion follows adobe.com too: `.reveal`
 * content rises in on scroll (ScrollReveal), large media `.settle` into place, the "Later" band
 * opens like a garage door and its grid lands column by column (CSS scroll timelines). All of
 * it is off for reduced motion.
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
      <Stories />
      <Plans />
      <Faq />
      <Roadmap />
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
    <span className={`detail rounded-full border px-2 py-0.5 text-[0.625rem] ${tone} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

/**
 * Everything it does, as a guided tour of the services (adobe.com-style feature tabs): a product
 * screen per service, drawn in code from the same visuals as the rest of the page.
 */
function Services() {
  const visuals: Record<string, ReactNode> = {
    "rough-cut": (
      <div className="space-y-4">
        <CutStripVisual />
        <RoughCutVisual />
      </div>
    ),
    captions: (
      <div className="space-y-4">
        <p className="mx-auto w-fit rounded-md bg-black/70 px-3 py-1.5 text-center text-sm text-white">
          {features.blocks.captions.lines[1]}
        </p>
        <ChaptersVisual />
        <ThumbnailsVisual />
      </div>
    ),
    export: (
      <div className="space-y-3">
        <HandoffVisual />
        <p className="flex flex-wrap gap-2">
          {hero.apps.map((app) => (
            <span
              key={app}
              className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-muted"
            >
              {app}
            </span>
          ))}
        </p>
      </div>
    ),
    review: <ReviewThread />,
    audit: <AuditMiniBody />,
    next: <NextMiniBody />,
  };
  const items = services.cards.map((card) => ({
    ...card,
    icon: serviceIcons[card.id] ?? "rough-cut",
    visual: visuals[card.id],
  }));
  return (
    <section
      id="product"
      aria-labelledby="services-heading"
      className="pt-16 pb-16 sm:pt-28 sm:pb-24"
    >
      <div className={container}>
        <SectionIntro
          center
          id="services-heading"
          eyebrow={services.eyebrow}
          heading={services.heading}
          lead={services.lead}
        />
        <div className="reveal mt-14">
          <ServiceSwitcher items={items} />
        </div>

        <div className="reveal mt-6 flex flex-col items-center gap-4 rounded-[1.75rem] border border-line p-5 sm:p-6">
          <h3 className="detail text-faint">{services.loopHeading}</h3>
          {/* Wraps and centres. No sideways scrolling: a scroll box with nothing to focus in it
              can't be scrolled from the keyboard (axe: scrollable-region-focusable). */}
          <ol className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2.5">
            {services.loop.map((stage, index) => (
              <li key={stage.step} className="flex shrink-0 items-center gap-1.5">
                <span className="flex items-center gap-2 rounded-full bg-raised py-2 ps-3 pe-3.5">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${
                      stage.status === "first"
                        ? "bg-keep"
                        : stage.status === "beta"
                          ? "bg-brand"
                          : stage.status === "later"
                            ? "bg-faint"
                            : "bg-fg"
                    }`}
                  />
                  <span className="text-sm font-semibold">{stage.step}</span>
                  <span className="detail text-[0.625rem] text-faint">
                    {stage.status ? statusLabels[stage.status] : "You"}
                  </span>
                </span>
                {index < services.loop.length - 1 && (
                  <ArrowRightIcon className="hidden size-4 text-faint sm:block" />
                )}
              </li>
            ))}
            <li aria-hidden="true" className="shrink-0 ps-1 text-brand">
              <LoopIcon className="size-5" />
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="how-it-works" aria-labelledby="story-heading">
      <div className={`${container} py-20 sm:py-28 lg:py-32`}>
        <SectionIntro center id="story-heading" eyebrow={story.eyebrow} heading={story.heading} />
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <article className="reveal overflow-hidden rounded-[2rem] bg-raised">
            <Photo
              src={nightEdit}
              alt={story.before.imageAlt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/9] rounded-none"
            />
            <div className="p-6 sm:p-10">
              <p className="detail text-faint">{story.before.label}</p>
              <h3 className="display mt-3 text-2xl leading-tight font-bold tracking-[-0.015em] sm:text-3xl">
                {story.before.title}
              </h3>
              <ol className="mt-6 space-y-4">
                {story.before.beats.map((beat) => (
                  <li key={beat.time} className="grid grid-cols-[5.5rem_1fr] gap-3">
                    <span className="text-sm font-semibold text-faint tabular-nums">
                      {beat.time}
                    </span>
                    <span className="text-muted">{beat.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          {/* The same evening with the product: the navy highlight card. */}
          <article className="reveal theme-dark overflow-hidden rounded-[2rem] bg-navy">
            <Photo
              src={eveningBack}
              alt={story.after.imageAlt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/9] rounded-none"
            />
            <div className="p-6 sm:p-10">
              <p className="detail text-accent">{story.after.label}</p>
              <h3 className="display mt-3 text-2xl leading-tight font-bold tracking-[-0.015em] sm:text-3xl">
                {story.after.title}
              </h3>
              <ol className="mt-6 space-y-4">
                {story.after.beats.map((beat) => (
                  <li key={beat.tag} className="grid grid-cols-[5.5rem_1fr] items-start gap-3">
                    <span className="detail w-fit rounded-full border border-accent px-2.5 py-1 text-[0.6875rem] text-accent">
                      {beat.tag}
                    </span>
                    <span className="text-fg">{beat.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </div>
        <p className="mt-5 text-center text-sm text-faint">{story.note}</p>
      </div>
    </section>
  );
}

function TryIt() {
  return (
    <section id="try-it" aria-labelledby="try-heading" className="bg-raised">
      <div
        className={`${container} grid items-center gap-14 py-20 sm:py-28 lg:py-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16`}
      >
        <div>
          <SectionIntro
            id="try-heading"
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
        {/* The demo is an editor screen, and video editors are dark: a dark window on a light page. */}
        <div className="reveal theme-dark rounded-[1.5rem] bg-transparent">
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
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
      <div className={`reveal ${props.flip ? "lg:order-2" : ""}`}>
        <div className="settle">{props.media}</div>
      </div>
      <div className={`reveal ${props.flip ? "lg:order-1" : ""}`}>
        <p className="detail text-faint tabular-nums">
          <span className="text-accent">0{props.index}</span> / 0{props.total}
        </p>
        <h3 className="display mt-4 text-3xl leading-[1.02] font-extrabold tracking-[-0.025em] text-balance sm:text-4xl lg:text-5xl">
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
    <section id="features" aria-labelledby="features-heading">
      <div className={`${container} py-20 sm:py-28 lg:py-32`}>
        <SectionIntro
          center
          id="features-heading"
          eyebrow={features.eyebrow}
          heading={features.heading}
          lead={features.note}
        />
        <div className="mt-20 space-y-24 lg:space-y-36">
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
                <span className="pointer-events-none absolute top-3 right-3 font-mono text-[0.65rem] text-white/80">
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

        <h3 className="detail mt-32 text-center text-faint">{features.extrasHeading}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          <li className="reveal flex flex-col gap-6 rounded-[1.75rem] bg-raised p-6">
            <div className="rounded-2xl bg-bg p-4 shadow-soft">
              <ChaptersVisual />
            </div>
            <div>
              <h4 className="display text-xl font-bold tracking-[-0.015em]">
                {features.chapters.title}
              </h4>
              <p className="mt-2 text-muted">{features.chapters.body}</p>
            </div>
          </li>
          <li className="reveal flex flex-col gap-6 rounded-[1.75rem] bg-raised p-6">
            <div className="rounded-2xl bg-bg p-4 shadow-soft">
              <ThumbnailsVisual />
            </div>
            <div>
              <h4 className="display text-xl font-bold tracking-[-0.015em]">
                {features.thumbnails.title}
              </h4>
              <p className="mt-2 text-muted">{features.thumbnails.body}</p>
            </div>
          </li>
          <li className="reveal flex flex-col justify-center rounded-[1.75rem] border border-line p-6">
            <h4 className="detail text-faint">{features.notList.heading}</h4>
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

function AuditSection() {
  return (
    <section id="channel-audit" aria-labelledby="audit-heading" className="bg-raised">
      <div
        className={`${container} grid gap-14 py-20 sm:py-28 lg:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}
      >
        <div>
          <SectionIntro
            id="audit-heading"
            eyebrow={audit.eyebrow}
            heading={audit.heading}
            lead={audit.lead}
          />
          <ol className="mt-10 space-y-6">
            {audit.steps.map((step, index) => (
              <li key={step.title} className="reveal grid grid-cols-[2.25rem_1fr] gap-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-keep-soft text-sm font-bold text-keep">
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
    <section id="next-video" aria-labelledby="next-heading">
      <div
        className={`${container} grid gap-14 py-20 sm:py-28 lg:py-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16`}
      >
        <div className="reveal order-2 lg:order-1">
          <NextVideoPreview />
        </div>
        <div className="order-1 lg:order-2">
          <SectionIntro
            id="next-heading"
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

function Stories() {
  return (
    // overflow-x-clip: the slider settles from slightly wider than the page; clip, not hidden, so
    // the page (not this section) stays the scroll timeline.
    <section aria-labelledby="stories-heading" className="overflow-x-clip py-20 sm:py-28">
      <div className={container}>
        <p id="stories-heading" className="text-center text-lg font-semibold text-muted">
          {stories.label}
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
    <section id="plans" aria-labelledby="plans-heading" className="bg-raised">
      <div className={`${container} py-20 sm:py-28 lg:py-32`}>
        <SectionIntro
          center
          id="plans-heading"
          eyebrow={plans.eyebrow}
          heading={plans.heading}
          lead={plans.lead}
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.items.map((plan) => (
            <li
              key={plan.name}
              className={`reveal relative flex flex-col overflow-hidden rounded-[1.75rem] p-7 ${
                plan.founding ? "theme-dark bg-navy shadow-lift" : "bg-bg shadow-soft"
              }`}
            >
              {plan.founding && (
                <span className="detail absolute top-5 right-5 rounded-full bg-accent px-2.5 py-1 text-[0.625rem] text-on-accent">
                  {plans.founding.badge}
                </span>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="display text-5xl font-extrabold tracking-[-0.025em]">
                  {plan.price}
                </span>
                <span className="text-sm text-muted">{plans.perMonth}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-accent">
                {plans.footage(plan.footage)}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-5">
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
        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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
    <section id="faq" aria-labelledby="faq-heading">
      <div
        className={`${container} grid gap-12 py-20 sm:py-28 lg:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro
            id="faq-heading"
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
              <ArrowRightIcon className="size-4" />
            </Link>
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faq.items.map((item) => (
            <details key={item.q} className="faq-item group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-raised text-fg transition-[transform,background-color] duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-on-ink"
                >
                  <PlusIcon className="size-4" />
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

// Staggered parallax in the dark grid (adobe.com "parallax stagger ltr"): each column starts a
// little lower than the one before it, and they land together as the grid arrives. One column on
// phones (no lag), two on tablets, three on large screens.
const tabletLag = ["sm:[--lag:0px]", "sm:[--lag:2.5rem]"];
const desktopLag = ["lg:[--lag:0px]", "lg:[--lag:2.5rem]", "lg:[--lag:5rem]"];

/** The dark ending starts here: a photo that opens like a garage door, then a black grid. */
function Roadmap() {
  return (
    <section id="roadmap" aria-labelledby="roadmap-heading" className="theme-dark pb-20 sm:pb-32">
      {/* The window opens out of the white page above it. */}
      <div className="bg-white">
        <div className="door relative isolate flex min-h-[36rem] items-end overflow-hidden sm:min-h-[42rem] lg:h-[92svh] lg:max-h-[54rem]">
          <Image
            src={nightEdit}
            alt=""
            sizes="100vw"
            placeholder="blur"
            className="door-media absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#000_0%,rgb(0_0_0/0.6)_40%,rgb(0_0_0/0.25)_100%)]"
          />
          <div className={`${container} pb-20 sm:pb-28`}>
            <SectionIntro
              center
              id="roadmap-heading"
              eyebrow={roadmap.eyebrow}
              heading={roadmap.heading}
              lead={roadmap.lead}
            />
          </div>
          <AiCredit className="absolute top-5 right-5" />
        </div>
      </div>
      <div className={container}>
        {/* A list, not a swipe row: these cards hold nothing to focus, so a sideways scroll box
            could not be scrolled from the keyboard. Compact on phones. */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.items.map((item, index) => (
            <li key={item.title} className="reveal">
              <div className={`lag h-full ${tabletLag[index % 2]} ${desktopLag[index % 3]}`}>
                <div className="flex h-full flex-col rounded-[1.5rem] bg-raised p-6 transition-colors duration-300 hover:bg-panel sm:min-h-60 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <ServiceIcon name={laterIcons[index] ?? "publish"} size="md" />
                    <StatusPill status="later" />
                  </div>
                  <h3 className="display mt-auto pt-6 text-2xl font-bold tracking-[-0.015em] sm:pt-12">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted">{item.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section
      id="waitlist"
      aria-labelledby="waitlist-heading"
      className="theme-dark relative isolate overflow-hidden"
    >
      <Image
        src={eveningBack}
        alt=""
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#000_0%,rgb(0_0_0/0.55)_30%,rgb(0_0_0/0.55)_70%,#000_100%)] lg:bg-[linear-gradient(to_right,#000_20%,rgb(0_0_0/0.8)_55%,rgb(0_0_0/0.5)_100%)]"
      />
      <div
        className={`${container} grid gap-12 py-20 sm:py-28 lg:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20`}
      >
        <div className="reveal">
          <h2
            id="waitlist-heading"
            className="display text-5xl leading-[0.96] font-extrabold tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl"
          >
            {finalCta.heading}
          </h2>
          <p className="mt-6 max-w-md text-lg text-pretty text-muted">{finalCta.lead}</p>
        </div>
        {/* A white form card on the dark photo (adobe.com puts forms on white). */}
        <div className="reveal theme-light rounded-[1.75rem] p-6 shadow-lift sm:p-9">
          <WaitlistForm />
        </div>
      </div>
      <AiCredit className="absolute right-4 bottom-4" />
    </section>
  );
}
