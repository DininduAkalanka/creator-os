"use client";

import Image, { getImageProps, type StaticImageData } from "next/image";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import heroPoster from "@/assets/media/hero-poster.jpg";
import heroPosterVertical from "@/assets/media/hero-poster-vertical.jpg";
import nightEdit from "@/assets/media/night-edit.jpg";
import personaEducator from "@/assets/media/persona-educator.jpg";
import reviewTogether from "@/assets/media/review-together.jpg";
import talkingPoster from "@/assets/media/talking-poster.jpg";
import { hero } from "@/content/home";
import { carouselCopy, heroSlides, statusLabels, type ServiceStatus } from "@/content/services";
import { siteCopy } from "@/content/site";
import { swipeStep } from "@/lib/motion";
import { AuditMini, NextMini, ReviewMini } from "./product-previews";
import { buttonLarge, buttonPrimary, buttonSecondary, container } from "./styles";

const SLIDE_MS = 8000;

type Media =
  | { kind: "video"; poster: StaticImageData; sources: Array<{ src: string; media?: string }> }
  | { kind: "photo"; image: StaticImageData; dim?: boolean };

/** Media and floating UI per slide, in the same order as heroSlides. */
const SLIDE_MEDIA: Array<{ media: Media; overlay?: ReactNode }> = [
  {
    media: {
      kind: "video",
      poster: heroPoster,
      sources: [
        { src: "/videos/hero-loop-vertical.mp4", media: "(max-width: 767px)" },
        { src: "/videos/hero-loop.mp4" },
      ],
    },
  },
  {
    media: { kind: "video", poster: talkingPoster, sources: [{ src: "/videos/talking-loop.mp4" }] },
    overlay: (
      <p
        aria-hidden="true"
        className="rounded-lg bg-black/85 px-4 py-2 text-center text-lg text-white shadow-2xl"
      >
        The trick is to batch your ideas first.
      </p>
    ),
  },
  { media: { kind: "photo", image: reviewTogether }, overlay: <ReviewMini /> },
  { media: { kind: "photo", image: nightEdit, dim: true }, overlay: <AuditMini /> },
  { media: { kind: "photo", image: personaEducator }, overlay: <NextMini /> },
];

/** Status colour of the small label in each tab (the active tab is navy, so it uses white). */
const tabStatusTone: Record<ServiceStatus, string> = {
  first: "text-keep",
  beta: "text-accent",
  later: "text-faint",
};

const order = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Hero, light (v6, adobe.com's white homepage): the page's message on white, then a large rounded
 * "stage" with the service swapper, and a row of tab cards under it (the active one turns navy,
 * with a progress line). While the page scrolls, the message moves up faster than the page and
 * the stage opens to its full size (CSS scroll timelines, globals.css).
 *
 * The swapper: auto-advance, an arrow to move on, swipe on touch screens; the incoming slide's
 * text rises in and its picture settles. Rotation keeps going while the mouse rests on the stage
 * (as on adobe.com). It holds while the pointer is on the tab bar and while keyboard focus is
 * inside, then continues where it stopped. The progress line shows this.
 *
 * Accessibility (WAI-ARIA APG tabbed carousel): tabs with roving focus and arrow keys; inactive
 * slides are inert; slide changes are announced only while rotation is off; one button pauses
 * both the rotation and the video (WCAG 2.2.2); nothing moves for reduced-motion or data-saver
 * visitors.
 *
 * Loading (adobe.com eager/lazy phases): slide 1's poster is the only eager media. Other slides'
 * images and all videos mount after the page has loaded; videos never download until played.
 */
export function HeroCarousel() {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pointerHold, setPointerHold] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  // False until the first slide change, so slide 1's first paint stays exactly as loaded.
  const [changed, setChanged] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [shown, setShown] = useState<ReadonlySet<number>>(() => new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const swipeStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const total = heroSlides.length;

  // Motion preference, and the "lazy" phase: start after the page has loaded and gone idle.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    const allow = !reduced && !saveData;
    let idle: number | undefined;
    const ready = () => {
      const go = () => {
        setMotionAllowed(allow);
        setMediaReady(true);
      };
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(go, { timeout: 2500 });
      } else {
        idle = window.setTimeout(go, 1200);
      }
    };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
    return () => {
      window.removeEventListener("load", ready);
      if (idle !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
        window.clearTimeout(idle);
      }
    };
  }, []);

  // Only the active slide's video plays, and only while playing is on.
  useEffect(() => {
    const videos = sectionRef.current?.querySelectorAll<HTMLVideoElement>("video[data-slide]");
    videos?.forEach((video) => {
      const index = Number(video.dataset.slide);
      if (index === active && playing && motionAllowed) {
        video.play().then(
          () => setShown((previous) => new Set(previous).add(index)),
          () => undefined,
        );
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, [active, playing, motionAllowed, mediaReady]);

  // On phones the tab bar scrolls sideways: keep the active tab in view (the bar only, not the page).
  useEffect(() => {
    const tab = tabRefs.current[active];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - list.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left >= list.scrollLeft && right <= list.scrollLeft + list.clientWidth) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [active]);

  const rotating = motionAllowed && playing && !pointerHold && !focusHold;

  function go(index: number, focus = false) {
    const next = (index + total) % total;
    setMediaReady(true);
    setChanged(true);
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: total - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    go(target, true);
  }

  // Keyboard focus holds the rotation; a mouse click on a tab must not stop it for good.
  function onFocus(event: FocusEvent<HTMLElement>) {
    if (event.target.matches(":focus-visible")) setFocusHold(true);
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusHold(false);
  }

  // Touch swipe on the stage (not on the message above it, which is text to read).
  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = swipeStep(event.clientX - start.x, event.clientY - start.y, rtl);
    if (step !== 0) go(active + step);
  }

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={carouselCopy.label}
      onFocus={onFocus}
      onBlur={onBlur}
      className="relative isolate overflow-x-clip pt-10 pb-6 sm:pt-14"
    >
      {/* The page's h1, read once by screen readers (the visible one draws the cut). */}
      <h1 className="sr-only">{hero.headline}</h1>

      {/* The message on white. It moves up faster than the page and fades as the stage opens
          (adobe.com "parallax-move-up-fast"). Never hidden on load: it is the first paint. */}
      <div className={`${container} hero-lift text-center`}>
        <p className="label-mono inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1.5 text-[0.625rem] text-faint sm:text-[0.6875rem]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {hero.eyebrow}
        </p>
        <p
          aria-hidden="true"
          className="display mx-auto mt-6 max-w-[15ch] text-[clamp(2.75rem,6.6vw,6.25rem)] leading-[0.93] font-extrabold tracking-[-0.048em] text-balance"
        >
          {hero.headlineBefore} <span className="hero-cut">{hero.headlineCut}</span>{" "}
          {hero.headlineAfter}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted sm:text-xl">
          {hero.lead}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge}`}>
            {hero.primaryCta}
          </Link>
          <Link href="#try-it" className={`${buttonSecondary} ${buttonLarge}`}>
            {hero.secondaryCta}
          </Link>
        </div>
        <p className="mt-3 text-sm text-faint">{hero.status}</p>
      </div>

      <div className="mt-12 px-2 sm:mt-14 sm:px-3">
        {/* The stage: dark because it is media (video and photos), not page background. */}
        <div
          data-hero-stage=""
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          className="hero-open theme-dark relative mx-auto h-[clamp(32rem,80svh,48rem)] max-w-[100rem] touch-pan-y overflow-hidden rounded-[1.75rem] bg-[#0e0d1c] sm:rounded-[2.25rem]"
        >
          {/* Slides: stacked, crossfading. Announced only while rotation is off (APG). */}
          <div aria-live={rotating ? "off" : "polite"} className="absolute inset-0">
            {heroSlides.map((slide, index) => {
              const isActive = index === active;
              const config = SLIDE_MEDIA[index];
              if (!config) return null;
              return (
                <div
                  key={slide.id}
                  id={`${baseId}-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`${baseId}-tab-${index}`}
                  aria-roledescription="slide"
                  aria-label={carouselCopy.slideOf(index + 1, total)}
                  inert={!isActive}
                  className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "is-active z-10 opacity-100" : "z-0 opacity-0"}`}
                >
                  <div className={`absolute inset-0 ${changed ? "slide-settle" : ""}`}>
                    <SlideMedia
                      index={index}
                      media={config.media}
                      mounted={index === 0 || mediaReady}
                      videoAllowed={mediaReady && motionAllowed}
                      shown={shown.has(index)}
                    />
                  </div>
                  {/* Legibility: dark at the bottom (phones) and at the left (large screens). */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgb(6_6_14/0.92)_0%,rgb(6_6_14/0.6)_38%,rgb(6_6_14/0)_70%)] lg:bg-[linear-gradient(to_right,rgb(6_6_14/0.88)_0%,rgb(6_6_14/0.5)_40%,rgb(6_6_14/0)_68%)]"
                  />
                  {config.overlay && (
                    <div className="absolute top-1/2 right-[6%] hidden -translate-y-1/2 lg:block">
                      <div style={order(3)} className="slide-rise">
                        {config.overlay}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 px-5 pb-20 sm:px-10 sm:pb-24 lg:inset-y-0 lg:flex lg:items-center lg:px-16 lg:pb-0">
                    <div className="max-w-xl lg:max-w-[34rem]">
                      <p
                        style={order(0)}
                        className="slide-rise label-mono inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-white/85 backdrop-blur-sm"
                      >
                        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                        {slide.eyebrow}
                        <span className="hidden text-white/45 sm:inline" aria-hidden="true">
                          ·
                        </span>
                        <span className="hidden text-accent sm:inline">
                          {statusLabels[slide.status]}
                        </span>
                      </p>
                      <h2
                        style={order(1)}
                        className="slide-rise display mt-5 text-[clamp(2rem,3.8vw,3.6rem)] leading-[0.98] font-extrabold tracking-[-0.04em] text-balance"
                      >
                        {slide.heading}
                      </h2>
                      <p
                        style={order(2)}
                        className="slide-rise mt-4 hidden max-w-md text-pretty text-white/80 sm:block sm:text-lg"
                      >
                        {slide.lead}
                      </p>
                      <div style={order(3)} className="slide-rise mt-6">
                        <Link
                          href={slide.cta.href}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-navy transition-[background-color,transform] duration-200 hover:bg-white/90 active:scale-[0.98]"
                        >
                          {slide.cta.label}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <span className="label-mono pointer-events-none absolute top-4 left-4 z-20 rounded-full bg-black/60 px-2 py-1 text-[0.5625rem] text-white/85 sm:top-6 sm:left-6">
            {SLIDE_MEDIA[active]?.media.kind === "video"
              ? siteCopy.aiGeneratedVideo
              : siteCopy.aiGenerated}
          </span>

          {/* Pause and next, inside the stage (adobe.com puts its pause button there too). */}
          <div className="absolute right-4 bottom-4 z-20 flex gap-2 sm:right-6 sm:bottom-6">
            {motionAllowed && (
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? carouselCopy.pause : carouselCopy.play}
                className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75"
              >
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="currentColor">
                  {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label={carouselCopy.next}
              className="hidden size-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75 sm:flex"
            >
              <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab cards under the stage, with the time to the next slide in the active one. */}
        <div
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setPointerHold(true);
          }}
          onPointerLeave={() => setPointerHold(false)}
          className="mx-auto mt-3 max-w-[100rem]"
        >
          <div
            role="tablist"
            aria-label={carouselCopy.label}
            className="flex snap-x gap-2 overflow-x-auto [scrollbar-width:none] lg:grid lg:grid-cols-5 [&::-webkit-scrollbar]:hidden"
          >
            {heroSlides.map((slide, index) => {
              const isActive = index === active;
              return (
                <button
                  key={slide.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`${baseId}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${baseId}-panel-${index}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => go(index)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`relative flex min-w-[12.5rem] shrink-0 snap-start items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4 text-left text-[0.9375rem] font-semibold transition-colors duration-300 lg:min-w-0 ${
                    isActive ? "bg-ink text-on-ink" : "bg-raised text-fg hover:bg-panel"
                  }`}
                >
                  <span className="flex flex-col gap-1">
                    <span
                      className={`label-mono text-[0.5625rem] ${isActive ? "text-white/70" : tabStatusTone[slide.status]}`}
                    >
                      {statusLabels[slide.status]}
                    </span>
                    {slide.tab}
                  </span>
                  <span aria-hidden="true" className={isActive ? "text-white/70" : "text-faint"}>
                    ›
                  </span>
                  {isActive && motionAllowed && (
                    <span
                      key={`progress-${active}`}
                      aria-hidden="true"
                      onAnimationEnd={() => go(active + 1)}
                      style={{
                        animationDuration: `${SLIDE_MS}ms`,
                        animationPlayState: rotating ? "running" : "paused",
                      }}
                      className="tab-progress absolute inset-x-0 bottom-0 h-[3px] bg-brand"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SlideMedia(props: {
  index: number;
  media: Media;
  mounted: boolean;
  videoAllowed: boolean;
  shown: boolean;
}) {
  const { media } = props;
  if (!props.mounted) return null;
  const cover = "absolute inset-0 h-full w-full object-cover";

  if (media.kind === "photo") {
    return (
      <Image
        src={media.image}
        alt=""
        sizes="100vw"
        className={`${cover} ${media.dim ? "opacity-45" : ""}`}
      />
    );
  }

  return (
    <>
      {props.index === 0 ? (
        <FirstPoster />
      ) : (
        <Image src={media.poster} alt="" sizes="100vw" className={cover} />
      )}
      {props.videoAllowed && (
        <video
          data-slide={props.index}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className={`${cover} transition-opacity duration-700 ${props.shown ? "opacity-100" : "opacity-0"}`}
        >
          {media.sources.map((source) => (
            <source key={source.src} src={source.src} media={source.media} type="video/mp4" />
          ))}
        </video>
      )}
    </>
  );
}

/** Slide 1's poster: art-directed (vertical crop on phones), eager, high priority. */
function FirstPoster() {
  const common = {
    alt: "",
    sizes: "100vw",
    loading: "eager" as const,
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
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" (decorative) is in `rest` */}
      <img {...rest} className="absolute inset-0 h-full w-full object-cover" />
    </picture>
  );
}
