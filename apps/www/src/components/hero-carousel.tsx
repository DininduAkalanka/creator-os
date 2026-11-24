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
import { preload } from "react-dom";
import heroPoster from "@/assets/media/hero-poster.jpg";
import heroPosterVertical from "@/assets/media/hero-poster-vertical.jpg";
import nightEdit from "@/assets/media/night-edit.jpg";
import personaEducator from "@/assets/media/persona-educator.jpg";
import reviewTogether from "@/assets/media/review-together.jpg";
import talkingPoster from "@/assets/media/talking-poster.jpg";
import { hero } from "@/content/home";
import {
  carouselCopy,
  heroSlides,
  serviceIcons,
  statusLabels,
  type ServiceStatus,
} from "@/content/services";
import { siteCopy } from "@/content/site";
import { swipeStep } from "@/lib/motion";
import { ArrowRightIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "./icons";
import { AuditMini, NextMini, ReviewMini } from "./product-previews";
import { ServiceIcon } from "./service-icon";
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
      <p className="rounded-lg bg-black/85 px-4 py-2 text-center text-lg text-white shadow-2xl">
        The trick is to batch your ideas first.
      </p>
    ),
  },
  { media: { kind: "photo", image: reviewTogether }, overlay: <ReviewMini /> },
  { media: { kind: "photo", image: nightEdit, dim: true }, overlay: <AuditMini /> },
  { media: { kind: "photo", image: personaEducator }, overlay: <NextMini /> },
];

const statusTone: Record<ServiceStatus, string> = {
  first: "text-keep",
  beta: "text-accent",
  later: "text-faint",
};

const order = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Hero, laid out like adobe.com's: one large rounded media frame that fills the first screen,
 * with the menu floating over its top (see HeaderShell), the message left-aligned in the content
 * column, and the slides' tab cards inside the frame at the bottom, as wide as the content.
 * While the page scrolls, the message moves up faster than the page and fades, and the media
 * drifts more slowly (parallax; CSS scroll timelines, globals.css).
 *
 * The swapper: auto-advance with the time shown in the active tab card; it keeps going while the
 * mouse rests on the media, holds while the pointer is on the tab cards or keyboard focus is
 * inside, and continues where it stopped. Arrow keys, Home and End move between tabs; touch
 * screens swipe. The incoming slide's text rises in and its picture settles.
 *
 * Accessibility (WAI-ARIA APG tabbed carousel): inactive slides are inert; changes are announced
 * only while rotation is off; one button pauses both the rotation and the video (WCAG 2.2.2),
 * and screen readers are told so. Nothing moves for reduced-motion or data-saver visitors.
 *
 * Loading (adobe.com eager/lazy phases): slide 1's poster is the only eager media and is never
 * hidden on load. Other slides' images and all videos mount after the page has loaded; videos
 * never download until played.
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

  // On phones the tab row scrolls sideways: keep the active tab in view (the row only, not the page).
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

  // Touch swipe on the media frame (the tab row scrolls sideways on phones, so it is excluded).
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
      // Pulled up under the sticky header (72 px), so the menu floats over the media.
      className="relative isolate -mt-[4.5rem] px-2 sm:px-3"
    >
      {/* The page's h1, read once by screen readers (the visible one draws the cut). */}
      <h1 className="sr-only">{hero.headline}</h1>
      {motionAllowed && <p className="sr-only">{carouselCopy.autoplayNote}</p>}

      <div
        data-hero-stage=""
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
        // Dark because it is media (video and photos), not page background. It fills the first
        // screen, and grows rather than letting the words run into the tab cards (short screens,
        // long translations): the words and the tab row are in normal flow, the media behind them.
        // Full width at every size, like adobe.com's full-bleed hero (v6.3 capped it at 1600 px,
        // which left white bands on 27-inch screens); the words stay in the centred container.
        // Height: the first screen, between 38rem and 60rem; very wide screens (over ~2180 px)
        // may grow to 44vw, so the frame never gets much wider than about 2.25 : 1 and faces
        // aren't cropped off.
        className="theme-dark relative flex min-h-[clamp(38rem,calc(100svh-3rem),max(60rem,44vw))] touch-pan-y flex-col overflow-hidden rounded-[1.75rem] bg-[#0e0d1c] sm:rounded-[2.25rem]"
      >
        {/* Media: every slide's picture or video, crossfading; it drifts slowly on scroll. */}
        <div aria-hidden="true" className="hero-drift absolute inset-0">
          {heroSlides.map((slide, index) => {
            const config = SLIDE_MEDIA[index];
            if (!config) return null;
            const isActive = index === active;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "is-active opacity-100" : "opacity-0"}`}
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
              </div>
            );
          })}
        </div>

        {/* Legibility: dark under the menu, behind the message and behind the tab cards. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#06060e]/70 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#06060e]/95 via-[#06060e]/55 to-transparent lg:h-1/2"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-3/4 bg-gradient-to-r from-[#06060e]/90 via-[#06060e]/45 to-transparent lg:block"
        />

        {/* The slides' words, one panel each, stacked in one grid cell so the tallest sets the
            height (no jump between slides); only the active one is shown and exposed. */}
        <div aria-live={rotating ? "off" : "polite"} className="relative grid flex-1">
          {heroSlides.map((slide, index) => {
            const isActive = index === active;
            const overlay = SLIDE_MEDIA[index]?.overlay;
            // Slide 1 is the first paint: never hidden on load, it only rises in after a change.
            const rise = index === 0 && !changed ? "" : "slide-rise";
            return (
              <div
                key={slide.id}
                id={`${baseId}-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`${baseId}-tab-${index}`}
                aria-roledescription="slide"
                aria-label={carouselCopy.slideOf(index + 1, total)}
                inert={!isActive}
                // One slide's words at a time: the old ones fade out in 150 ms, the new ones fade
                // and rise in after that (globals.css), so two headlines never overlap.
                className={`relative col-start-1 row-start-1 flex transition-opacity ${isActive ? "is-active z-10 opacity-100 delay-150 duration-300" : "pointer-events-none z-0 opacity-0 duration-150"}`}
              >
                {overlay && (
                  <div
                    aria-hidden="true"
                    className="absolute top-[45%] right-[5%] hidden -translate-y-1/2 xl:block"
                  >
                    <div style={order(3)} className="slide-rise">
                      {overlay}
                    </div>
                  </div>
                )}

                <div className="hero-lift mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pt-28 pb-6 sm:px-8 sm:pb-8 lg:justify-center lg:px-10 lg:pt-24">
                  <div className="max-w-2xl">
                    <p
                      style={order(0)}
                      className={`${rise} detail flex flex-wrap items-center gap-x-2 gap-y-1 text-white/90`}
                    >
                      <ServiceIcon
                        name={serviceIcons[slide.id] ?? "rough-cut"}
                        size="sm"
                        className="me-1"
                      />
                      {index === 0 ? hero.eyebrow : slide.eyebrow}
                      {/* Phones: the status gets its own line rather than a dangling dot. */}
                      <span aria-hidden="true" className="hidden text-white/45 sm:inline">
                        ·
                      </span>
                      <span className={`${statusTone[slide.status]} max-sm:basis-full`}>
                        {statusLabels[slide.status]}
                      </span>
                    </p>

                    {index === 0 ? (
                      <>
                        <p
                          aria-hidden="true"
                          style={order(1)}
                          className={`${rise} display mt-5 max-w-[18ch] text-[clamp(2.6rem,min(4.6vw,7.5svh),4.5rem)] leading-[1] tracking-[-0.035em] text-balance`}
                        >
                          {hero.headlineBefore} <span className="hero-cut">{hero.headlineCut}</span>{" "}
                          {hero.headlineAfter}
                        </p>
                        <p
                          style={order(2)}
                          className={`${rise} mt-5 max-w-lg text-lg leading-relaxed text-pretty text-white/85 sm:text-xl`}
                        >
                          {hero.lead}
                        </p>
                        <div
                          style={order(3)}
                          className={`${rise} mt-8 flex flex-wrap items-center gap-3`}
                        >
                          <Link href="#waitlist" className={`${buttonPrimary} ${buttonLarge}`}>
                            {hero.primaryCta}
                          </Link>
                          <Link href="#try-it" className={`${buttonSecondary} ${buttonLarge}`}>
                            {hero.secondaryCta}
                          </Link>
                        </div>
                        <p className="mt-4 text-sm text-white/70">{hero.status}</p>
                      </>
                    ) : (
                      <>
                        <h2
                          style={order(1)}
                          className="slide-rise display mt-5 max-w-[18ch] text-[clamp(2.4rem,min(4.4vw,7svh),4.25rem)] leading-[1] tracking-[-0.035em] text-balance"
                        >
                          {slide.heading}
                        </h2>
                        <p
                          style={order(2)}
                          className="slide-rise mt-5 max-w-lg text-lg leading-relaxed text-pretty text-white/85 sm:text-xl"
                        >
                          {slide.lead}
                        </p>
                        <div style={order(3)} className="slide-rise mt-8">
                          <Link href={slide.cta.href} className={`${buttonPrimary} ${buttonLarge}`}>
                            {slide.cta.label}
                            <ArrowRightIcon className="size-4" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab cards inside the frame, as wide as the content (adobe.com), then pause and next. */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-3 pb-3 sm:px-8 sm:pb-6 lg:px-10">
          {/* The media's label, like a photo credit: its own line on small screens; on large
              ones it floats above the controls, clear of the words in the left column. */}
          <p className="pointer-events-none mb-3 flex justify-end px-1 lg:absolute lg:end-10 lg:bottom-full lg:px-0">
            <span
              data-media-label=""
              className="rounded-full bg-black/55 px-2 py-0.5 text-[0.6875rem] font-medium text-white/90 backdrop-blur-sm"
            >
              {SLIDE_MEDIA[active]?.media.kind === "video"
                ? siteCopy.aiGeneratedVideo
                : siteCopy.aiGenerated}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label={carouselCopy.label}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPointerHold(true);
              }}
              onPointerLeave={() => setPointerHold(false)}
              // Phones: a sideways strip whose far edge fades, so a cut-off card reads as "more".
              className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] [scrollbar-width:none] after:w-6 after:shrink-0 after:content-[''] lg:grid lg:grid-cols-5 lg:[mask-image:none] lg:after:hidden rtl:[mask-image:linear-gradient(to_left,#000_calc(100%-2.5rem),transparent)] rtl:lg:[mask-image:none] [&::-webkit-scrollbar]:hidden"
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
                    className={`relative flex min-w-[12.5rem] shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-start transition-colors duration-300 lg:min-w-0 ${
                      isActive
                        ? "theme-light bg-white"
                        : "bg-black/50 text-white ring-1 ring-white/15 ring-inset hover:bg-black/65"
                    }`}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <ServiceIcon name={serviceIcons[slide.id] ?? "rough-cut"} size="sm" />
                      <span
                        className={`detail text-[0.625rem] ${isActive ? statusTone[slide.status] : "text-white/70"}`}
                      >
                        {statusLabels[slide.status]}
                      </span>
                    </span>
                    <span className="flex w-full items-center justify-between gap-2 text-[0.9375rem] font-bold">
                      {slide.tab}
                      <ChevronRightIcon
                        className={`size-4 shrink-0 ${isActive ? "text-faint" : "text-white/60"}`}
                      />
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
            <div className="flex shrink-0 gap-2">
              {/* The pause button arrives once the page knows motion is allowed; its place is
                  kept from the first paint, so the tab cards never jump sideways. With reduced
                  motion nothing moves, so there is no button and no place for it. */}
              <span className="flex size-11 motion-reduce:hidden">
                {motionAllowed && (
                  <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    aria-label={playing ? carouselCopy.pause : carouselCopy.play}
                    className="flex size-11 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 transition-colors ring-inset hover:bg-black/70"
                  >
                    {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                  </button>
                )}
              </span>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label={carouselCopy.next}
                className="hidden size-11 items-center justify-center rounded-full bg-white text-[#0e0d1c] shadow-float transition-transform hover:scale-105 sm:flex"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>
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
  // Wide frames crop from the bottom rather than the middle: the faces are in the upper part.
  const cover = "absolute inset-0 h-full w-full object-cover object-[50%_30%]";

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

/**
 * Slide 1's poster: the LCP element (the media fills the first screen, as on adobe.com).
 * Art-directed (vertical crop on phones), eager, high priority, and preloaded: React puts the two
 * preloads, each limited to its own screens, at the top of <head>, so the picture is requested
 * before the stylesheet and the scripts instead of after them.
 */
function FirstPoster() {
  const common = {
    alt: "",
    sizes: "100vw",
    loading: "eager" as const,
    fetchPriority: "high" as const,
  };
  const {
    props: { srcSet: desktop, src: desktopSrc },
  } = getImageProps({ ...common, src: heroPoster });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: heroPosterVertical });
  const image = { as: "image", imageSizes: "100vw", fetchPriority: "high" } as const;
  preload(desktopSrc, { ...image, imageSrcSet: desktop, media: "(min-width: 768px)" });
  preload(rest.src, { ...image, imageSrcSet: mobile, media: "(max-width: 767px)" });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source media="(max-width: 767px)" srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" (decorative) is in `rest` */}
      <img {...rest} className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
    </picture>
  );
}
