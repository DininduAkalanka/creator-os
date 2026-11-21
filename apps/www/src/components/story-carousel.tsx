"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { stories } from "@/content/services";
import { siteCopy } from "@/content/site";
import { swipeStep } from "@/lib/motion";

const STORY_MS = 7000;
/** Slides drawn on each side of the current one, so moving never shows an empty edge. */
const SPAN = 2;

const mod = (value: number, size: number) => ((value % size) + size) % size;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const reducedMotionNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// On the server assume reduced motion: nothing starts moving before the page is interactive.
const reducedMotionOnServer = () => true;

/**
 * Story slider modelled on adobe.com's testimonial carousel, without testimonials: use-case
 * statements over AI-generated photos (labelled). Full width and nearly full height; the current
 * story sits in the middle with its neighbours peeking in from both edges, and it goes round
 * forever, so there is always a neighbour on each side.
 *
 * It moves on by itself every 7 s, with the time shown in the active dot (WCAG 2.2.2: there is a
 * pause button). Rotation holds while the pointer is on the arrows or dots, while keyboard focus
 * is inside, while it is mostly off screen and while a slide is being dragged; it never starts
 * for reduced-motion visitors. Drag or swipe to move; a click on a neighbour moves to it.
 *
 * Only the current story is exposed to assistive technology (the others are inert); changes are
 * announced only while rotation is off (APG carousel).
 */
export function StoryCarousel({ images }: { images: Record<string, StaticImageData> }) {
  const slides = stories.slides;
  const total = slides.length;
  // Unbounded: the story shown is position mod total, so the slider can go round forever.
  const [position, setPosition] = useState(0);
  const active = mod(position, total);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionNow,
    reducedMotionOnServer,
  );
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [pointerHold, setPointerHold] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    dx: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const suppressClick = useRef(false);

  const rotating = !reducedMotion && playing && onScreen && !pointerHold && !focusHold && !dragging;

  // Rotate only while at least half of the slider is on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { threshold: 0.5 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // When a drag ends, reset the finger offset in the same frame as the new position, so the
  // slides glide on from where the finger left them.
  useLayoutEffect(() => {
    if (!dragging) trackRef.current?.style.setProperty("--drag", "0px");
  }, [dragging]);

  function step(by: number) {
    setPosition((value) => value + by);
  }

  function goTo(index: number) {
    const ahead = mod(index - active, total);
    step(ahead > total / 2 ? ahead - total : ahead);
  }

  function isRtl(element: Element) {
    return getComputedStyle(element).direction === "rtl";
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (!event.isPrimary || event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, axis: null };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.axis === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (current.axis === "y") {
        drag.current = null; // the visitor is scrolling the page
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    current.dx = dx;
    event.currentTarget.style.setProperty("--drag", `${dx}px`);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const current = drag.current;
    drag.current = null;
    if (!current || current.id !== event.pointerId || current.axis !== "x") return;
    suppressClick.current = true; // the click that follows a drag must not open a link
    setDragging(false);
    if (cancelled) return;
    const by = swipeStep(current.dx, 0, isRtl(event.currentTarget));
    if (by !== 0) step(by);
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // Neighbours are inert, so a click on one lands on the track: move to that neighbour.
  function onTrackClick(event: MouseEvent<HTMLDivElement>) {
    const current = event.currentTarget.querySelector<HTMLElement>("[data-current]");
    if (!current) return;
    const box = current.getBoundingClientRect();
    const rtl = isRtl(event.currentTarget);
    if (event.clientX < box.left) step(rtl ? 1 : -1);
    else if (event.clientX > box.right) step(rtl ? -1 : 1);
  }

  // Keyboard focus holds the rotation; a mouse click on a dot or arrow must not stop it for good.
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    if (event.target.matches(":focus-visible")) setFocusHold(true);
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusHold(false);
  }

  const holdOnHover = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === "mouse") setPointerHold(true);
    },
    onPointerLeave: () => setPointerHold(false),
  };

  const positions = Array.from({ length: SPAN * 2 + 1 }, (_, index) => position - SPAN + index);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={stories.label}
      onFocus={onFocus}
      onBlur={onBlur}
      className="relative overflow-x-clip [--dir:1] [--gap:0.5rem] [--peek:1.25rem] rtl:[--dir:-1] sm:[--gap:0.75rem] sm:[--peek:3.5rem] lg:[--peek:max(5rem,8%)]"
    >
      <div
        ref={trackRef}
        aria-live={rotating ? "off" : "polite"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endDrag(event, false)}
        onPointerCancel={(event) => endDrag(event, true)}
        onClickCapture={onClickCapture}
        onClick={onTrackClick}
        className={`relative h-[34rem] touch-pan-y sm:h-[38rem] lg:h-[clamp(38rem,calc(100svh_-_9rem),54rem)] ${dragging ? "cursor-grabbing select-none" : ""}`}
      >
        {positions.map((key) => {
          const offset = key - position;
          const index = mod(key, total);
          const slide = slides[index];
          if (!slide) return null;
          const current = offset === 0;
          const image = images[slide.key];
          return (
            <div
              key={key}
              role="group"
              aria-roledescription="slide"
              aria-label={stories.goTo(index + 1, total)}
              aria-hidden={!current}
              inert={!current}
              data-current={current ? "" : undefined}
              style={{
                transform: `translateX(calc(-50% + ${offset} * var(--dir) * (100% + var(--gap)) + var(--drag, 0px)))`,
              }}
              className={`absolute top-0 left-1/2 h-full w-[calc(100%_-_2*var(--peek))] overflow-hidden rounded-[1.5rem] bg-panel ${
                dragging
                  ? ""
                  : "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
              }`}
            >
              {image && (
                <Image
                  src={image}
                  alt={slide.imageAlt}
                  sizes="(min-width: 1024px) 84vw, 100vw"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(12_11_10/0.95)_15%,rgb(12_11_10/0.4)_60%,transparent)] md:bg-[linear-gradient(to_right,rgb(12_11_10/0.92)_25%,rgb(12_11_10/0.45)_60%,transparent)]"
              />
              <div className="relative flex h-full max-w-3xl flex-col justify-end p-6 pb-20 text-white sm:p-10 sm:pb-20 md:justify-center md:p-16 lg:p-20">
                <p className="label-mono text-[#ff8a5c]">{slide.eyebrow}</p>
                <h3 className="display mt-4 text-3xl leading-[1.02] font-semibold text-balance sm:text-5xl lg:text-6xl">
                  {slide.heading}
                </h3>
                <p className="mt-5 max-w-md text-lg text-white/80">{slide.body}</p>
                <Link
                  href="#waitlist"
                  draggable={false}
                  className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0c0b0a] transition-colors hover:bg-white/85"
                >
                  {siteCopy.nav.cta}
                </Link>
              </div>
              <span className="label-mono pointer-events-none absolute top-4 right-4 rounded-full bg-black/65 px-2 py-1 text-[0.5625rem] text-white/80">
                {siteCopy.aiGenerated}
              </span>
              {/* Neighbours stay darker, so the eye goes to the story in the middle. */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-[#0c0b0a] transition-opacity duration-700 ${current ? "opacity-0" : "opacity-55"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Arrows on the edges of the current story (adobe.com); phones swipe instead. */}
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={stories.previous}
        {...holdOnHover}
        className="absolute top-1/2 left-[max(0.5rem,calc(var(--peek)_-_1.375rem))] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0c0b0a] shadow-lg shadow-black/40 transition-transform hover:scale-105 sm:flex"
      >
        <svg viewBox="0 0 16 16" className="size-4 rtl:rotate-180" aria-hidden="true" fill="none">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={stories.next}
        {...holdOnHover}
        className="absolute top-1/2 right-[max(0.5rem,calc(var(--peek)_-_1.375rem))] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0c0b0a] shadow-lg shadow-black/40 transition-transform hover:scale-105 sm:flex"
      >
        <svg viewBox="0 0 16 16" className="size-4 rtl:rotate-180" aria-hidden="true" fill="none">
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dots inside the bottom of the current story, with the time to the next one in the
          active dot, and the pause button. Each control is a 24 px target (WCAG 2.5.8). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center">
        <div
          {...holdOnHover}
          className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/55 px-2"
        >
          {slides.map((slide, index) => {
            const isActive = index === active;
            return (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={stories.goTo(index + 1, total)}
                aria-current={isActive ? "true" : undefined}
                className="group flex h-6 min-w-6 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                    isActive
                      ? `w-8 ${reducedMotion ? "bg-white" : "bg-white/35"}`
                      : "w-1.5 bg-white/55 group-hover:bg-white/85"
                  }`}
                >
                  {isActive && !reducedMotion && (
                    <span
                      key={position}
                      onAnimationEnd={() => step(1)}
                      style={{
                        animationDuration: `${STORY_MS}ms`,
                        animationPlayState: rotating ? "running" : "paused",
                      }}
                      className="tab-progress absolute inset-0 rounded-full bg-white"
                    />
                  )}
                </span>
              </button>
            );
          })}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? stories.pause : stories.play}
              className="flex size-6 items-center justify-center text-white"
            >
              <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true" fill="currentColor">
                {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
