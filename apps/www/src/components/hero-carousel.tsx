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
import { carouselCopy, heroSlides, statusLabels } from "@/content/services";
import { siteCopy } from "@/content/site";
import { swipeStep } from "@/lib/motion";
import { AuditMini, NextMini, ReviewMini } from "./product-previews";
import { buttonLarge, buttonPrimary, buttonSecondary } from "./styles";

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
        className="rounded-md bg-black/85 px-4 py-2 text-center text-lg text-white shadow-2xl"
      >
        The trick is to batch your ideas first.
      </p>
    ),
  },
  { media: { kind: "photo", image: reviewTogether }, overlay: <ReviewMini /> },
  { media: { kind: "photo", image: nightEdit, dim: true }, overlay: <AuditMini /> },
  { media: { kind: "photo", image: personaEducator }, overlay: <NextMini /> },
];

const order = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Hero "swapper" modelled on adobe.com: full-bleed slides, a row of tab cards along the bottom
 * (active one turns white, with a progress line), auto-advance, an arrow to move on, and swipe on
 * touch screens. The incoming slide's text rises in and its picture settles. While the page
 * scrolls, the hero drifts up at half speed and dims under the next section (CSS, globals.css).
 *
 * Rotation keeps going while the mouse rests on the slide (as on adobe.com: on a full-screen hero
 * the mouse is nearly always there). It holds while the pointer is on the tab bar and while
 * keyboard focus is inside, then continues where it stopped. The progress line shows this.
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

  // Touch swipe. The tab bar scrolls sideways on phones, so drags that start there are its own.
  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") return;
    if (event.target instanceof Element && event.target.closest('[role="tablist"]')) return;
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
      className="relative isolate -mt-16 flex min-h-[max(40rem,calc(100svh-2.5rem))] touch-pan-y flex-col overflow-hidden bg-[#0c0b0a] text-white"
    >
      {/* The page's h1 (slide 1's message), read once by screen readers. */}
      <h1 className="sr-only">{hero.headline}</h1>

      <div className="hero-drift absolute inset-0">
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
                {/* Legibility gradients. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_top,#0c0b0a_6%,rgb(12_11_10/0.85)_40%,rgb(12_11_10/0.2)_100%)] md:bg-[linear-gradient(to_right,rgb(12_11_10/0.94)_22%,rgb(12_11_10/0.55)_55%,rgb(12_11_10/0.05)_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0c0b0a] to-transparent"
                />
                {config.overlay && (
                  <div className="absolute top-1/2 right-[6%] hidden -translate-y-1/2 lg:block">
                    <div style={order(3)} className="slide-rise">
                      {config.overlay}
                    </div>
                  </div>
                )}

                <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pt-28 pb-44 sm:px-6 md:justify-center md:pb-40 lg:px-8">
                  <div className="max-w-2xl">
                    <p
                      style={order(0)}
                      className="slide-rise label-mono inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-white/85"
                    >
                      <span className="size-1.5 rounded-full bg-[#ff5a1f]" aria-hidden="true" />
                      {index === 0 ? hero.eyebrow : slide.eyebrow}
                      <span className="hidden text-white/50 sm:inline" aria-hidden="true">
                        ·
                      </span>
                      <span className="hidden text-[#ff8a5c] sm:inline">
                        {statusLabels[slide.status]}
                      </span>
                    </p>
                    {index === 0 ? (
                      <>
                        <p
                          aria-hidden="true"
                          style={order(1)}
                          className={`${changed ? "slide-rise " : ""}display mt-6 text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[0.98] font-semibold text-balance`}
                        >
                          {hero.headlineBefore} <span className="hero-cut">{hero.headlineCut}</span>{" "}
                          {hero.headlineAfter}
                        </p>
                        <p
                          style={order(2)}
                          className="slide-rise mt-6 max-w-xl text-base text-pretty text-white/80 sm:text-xl"
                        >
                          {hero.lead}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2
                          style={order(1)}
                          className="slide-rise display mt-6 text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.98] font-semibold text-balance"
                        >
                          {slide.heading}
                        </h2>
                        <p
                          style={order(2)}
                          className="slide-rise mt-6 max-w-xl text-base text-pretty text-white/80 sm:text-xl"
                        >
                          {slide.lead}
                        </p>
                      </>
                    )}
                    <div
                      style={order(3)}
                      className="slide-rise mt-8 flex flex-wrap items-center gap-3"
                    >
                      <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge}`}>
                        {hero.primaryCta}
                      </Link>
                      <Link
                        href={slide.cta.href}
                        className={`${buttonSecondary} ${buttonLarge} border-white/30 bg-black/45 text-white hover:bg-black/60`}
                      >
                        {slide.cta.label}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab cards along the bottom (Adobe-style), with pause and next controls. */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setPointerHold(true);
            }}
            onPointerLeave={() => setPointerHold(false)}
            className="mx-auto flex w-full max-w-7xl items-end gap-2 px-4 pb-5 sm:px-6 lg:px-8"
          >
            <div
              role="tablist"
              aria-label={carouselCopy.label}
              className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    className={`relative flex min-w-[11.5rem] flex-1 snap-start items-center justify-between gap-3 overflow-hidden rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors duration-300 ${
                      isActive
                        ? "border-white bg-white text-[#0c0b0a]"
                        : "border-white/15 bg-black/55 text-white hover:border-white/35 hover:bg-black/75"
                    }`}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span
                        className={`label-mono text-[0.5625rem] ${isActive ? "text-[#b0390a]" : "text-white/60"}`}
                      >
                        {statusLabels[slide.status]}
                      </span>
                      {slide.tab}
                    </span>
                    <span aria-hidden="true">›</span>
                    {isActive && motionAllowed && (
                      <span
                        key={`progress-${active}`}
                        aria-hidden="true"
                        onAnimationEnd={() => go(active + 1)}
                        style={{
                          animationDuration: `${SLIDE_MS}ms`,
                          animationPlayState: rotating ? "running" : "paused",
                        }}
                        className="tab-progress absolute inset-x-0 bottom-0 h-[3px] bg-[#ff5a1f]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 gap-2 pb-1">
              {motionAllowed && (
                <button
                  type="button"
                  onClick={() => setPlaying((value) => !value)}
                  aria-label={playing ? carouselCopy.pause : carouselCopy.play}
                  className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-4"
                    aria-hidden="true"
                    fill="currentColor"
                  >
                    {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label={carouselCopy.next}
                className="hidden size-12 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white transition-colors hover:bg-black/80 sm:flex"
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
        </div>

        <span className="label-mono pointer-events-none absolute top-20 right-4 z-20 rounded-full bg-black/65 px-2 py-1 text-[0.5625rem] text-white/80 sm:right-6">
          {SLIDE_MEDIA[active]?.media.kind === "video"
            ? siteCopy.aiGeneratedVideo
            : siteCopy.aiGenerated}
        </span>
      </div>

      {/* Darkens as the next section slides over the hero (scroll-linked, globals.css). */}
      <div
        aria-hidden="true"
        className="hero-dim pointer-events-none absolute inset-0 z-30 bg-[#0c0b0a] opacity-0"
      />
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

/** Slide 1's poster: the LCP element. Art-directed (vertical crop on phones), eager, high priority. */
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
