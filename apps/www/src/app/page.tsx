import Image, { getImageProps, type StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import eveningBack from "@/assets/media/evening-back.jpg";
import footageLocal from "@/assets/media/footage-stays-local.jpg";
import heroPoster from "@/assets/media/hero-poster.jpg";
import heroPosterVertical from "@/assets/media/hero-poster-vertical.jpg";
import nightEdit from "@/assets/media/night-edit.jpg";
import personaCreator from "@/assets/media/persona-creator.jpg";
import personaEditor from "@/assets/media/persona-editor.jpg";
import personaEducator from "@/assets/media/persona-educator.jpg";
import reviewTogether from "@/assets/media/review-together.jpg";
import talkingPoster from "@/assets/media/talking-poster.jpg";
import timelineDetail from "@/assets/media/timeline-detail.jpg";
import { BackgroundVideo } from "@/components/background-video";
import { CutDemo } from "@/components/cut-demo";
import {
  ChaptersVisual,
  HandoffVisual,
  LocalFootageVisual,
  RoughCutVisual,
  ThumbnailsVisual,
} from "@/components/feature-visuals";
import { CheckIcon, CrossIcon } from "@/components/icons";
import { AiCredit, Photo, VideoPanel } from "@/components/media";
import { SectionIntro } from "@/components/section-intro";
import { buttonLarge, buttonPrimary, buttonSecondary, card, container } from "@/components/styles";
import { WaitlistForm } from "@/components/waitlist-form";
import {
  audiences,
  faq,
  features,
  finalCta,
  foundingOffer,
  hero,
  story,
  tryIt,
} from "@/content/home";

/** Stagger index for the load-in animation (globals.css .rise). */
const order = (index: number) => ({ "--i": index }) as CSSProperties;

const personaPhotos: Record<string, StaticImageData> = {
  creator: personaCreator,
  educator: personaEducator,
  editor: personaEditor,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Story />
      <TryIt />
      <Features />
      <Audiences />
      <FoundingOffer />
      <Faq />
      <Waitlist />
    </>
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

/**
 * Hero: a full-bleed video over its first frame. The poster is a responsive <picture> (vertical
 * crop on phones) and is the first thing painted; the video loads only after the page has
 * loaded (see BackgroundVideo). No preload hints, following adobe.com's measured guidance.
 */
function HeroPoster() {
  const common = {
    alt: "",
    sizes: "100vw",
    loading: "eager" as const,
    // The poster is the LCP element: fetch it ahead of scripts (fonts are not preloaded).
    fetchPriority: "high" as const,
  };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: heroPoster });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: heroPosterVertical });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source media="(max-width: 767px)" srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- art-directed poster from getImageProps; alt="" (decorative) is in `rest` */}
      <img {...rest} className="absolute inset-0 h-full w-full object-cover" />
    </picture>
  );
}

function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[calc(100svh-6rem)] items-end overflow-hidden md:items-center"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <HeroPoster />
      </div>
      <BackgroundVideo
        start="load"
        sources={[
          { src: "/videos/hero-loop-vertical.mp4", media: "(max-width: 767px)" },
          { src: "/videos/hero-loop.mp4" },
        ]}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        buttonClassName="absolute right-4 bottom-4 z-20 sm:right-6 sm:bottom-6"
      />
      {/* Legibility: dark from the text side (bottom on phones, left on larger screens). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--bg)_8%,rgb(12_11_10/0.85)_45%,rgb(12_11_10/0.15)_100%)] md:bg-[linear-gradient(to_right,rgb(12_11_10/0.95)_25%,rgb(12_11_10/0.6)_55%,rgb(12_11_10/0.1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-bg to-transparent"
      />

      <div className={`${container} py-16 sm:py-20`}>
        <div className="max-w-2xl">
          <p
            style={order(0)}
            className="rise label-mono inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-white/80"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {hero.eyebrow}
          </p>
          {/* Not animated: the headline must paint at once. */}
          <h1
            id="hero-heading"
            className="display mt-6 text-[clamp(2.6rem,6vw,5.25rem)] leading-[0.98] font-semibold text-balance text-white"
          >
            <span className="sr-only">{hero.headline}</span>
            <span aria-hidden="true">
              {hero.headlineBefore} <span className="hero-cut">{hero.headlineCut}</span>{" "}
              {hero.headlineAfter}
            </span>
          </h1>
          <p
            style={order(2)}
            className="rise mt-6 max-w-xl text-lg text-pretty text-white/80 sm:text-xl"
          >
            {hero.lead}
          </p>
          <div style={order(3)} className="rise mt-8 flex flex-wrap items-center gap-3">
            <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge}`}>
              {hero.primaryCta}
              <Arrow />
            </Link>
            <Link
              href="#try-it"
              className={`${buttonSecondary} ${buttonLarge} border-white/30 bg-black/45 text-white hover:bg-black/50`}
            >
              {hero.secondaryCta}
            </Link>
          </div>
          <p style={order(4)} className="rise mt-4 text-sm text-white/65">
            {hero.status}
          </p>
          <div style={order(5)} className="rise mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="label-mono text-white/65">{hero.exportsLabel}</span>
            {hero.apps.map((app) => (
              <span
                key={app}
                className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-sm text-white/80"
              >
                {app}
              </span>
            ))}
          </div>
        </div>
      </div>
      <AiCredit video className="absolute top-4 right-4 sm:top-6 sm:right-6" />
    </section>
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
          <CutDemo />
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
      <div className={`reveal ${props.flip ? "lg:order-2" : ""}`}>{props.media}</div>
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
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {audiences.items.map((audience) => {
            const photo = personaPhotos[audience.key];
            return (
              <li key={audience.key} className={`reveal ${card} overflow-hidden`}>
                {photo && (
                  <Photo
                    src={photo}
                    alt={audience.imageAlt}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="aspect-[4/3] rounded-none border-0"
                  />
                )}
                <div className="p-6 sm:p-7">
                  <h3 className="display text-2xl leading-tight font-semibold">{audience.title}</h3>
                  <p className="mt-3 text-muted">{audience.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function FoundingOffer() {
  return (
    <section id="offer" aria-labelledby="offer-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_75%_50%,rgb(255_90_31/0.16),transparent_70%)]"
      />
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
