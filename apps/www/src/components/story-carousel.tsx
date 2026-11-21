"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { stories } from "@/content/services";
import { siteCopy } from "@/content/site";

/**
 * Story slider modelled on adobe.com's testimonial carousel, without testimonials: use-case
 * statements over AI-generated photos (labelled). The current story sits in the centre with its
 * neighbours peeking in at both edges; arrows sit on the edges and clickable dots inside the slide.
 *
 * Built on native scroll-snap, so it swipes on touch and scrolls with a trackpad. Nothing moves by
 * itself. The arrows go round from the last story to the first.
 */
export function StoryCarousel({ images }: { images: Record<string, StaticImageData> }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const total = stories.slides.length;

  // Keep the dots in sync with whatever the visitor scrolled or swiped to.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll(":scope > li").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  function scrollTo(index: number) {
    const track = trackRef.current;
    const slide = track?.children[(index + total) % total] as HTMLElement | undefined;
    if (!track || !slide) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      // Centre the slide in the track (both are positioned against the same wrapper).
      left: slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div className="relative [--peek:1.25rem] sm:[--peek:3.5rem] lg:[--peek:max(5rem,calc((100%_-_76rem)/2))]">
      <ul
        ref={trackRef}
        aria-label={stories.label}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-[var(--peek)] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden"
      >
        {stories.slides.map((slide, index) => {
          const image = images[slide.key];
          const isActive = index === active;
          return (
            <li
              key={slide.key}
              data-index={index}
              aria-label={stories.goTo(index + 1, total)}
              className="relative w-full shrink-0 snap-center overflow-hidden rounded-[1.5rem]"
            >
              <div className="relative h-[34rem] sm:h-[38rem]">
                {image && (
                  <Image
                    src={image}
                    alt={slide.imageAlt}
                    sizes="(min-width: 1280px) 76rem, 100vw"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgb(12_11_10/0.95)_15%,rgb(12_11_10/0.4)_60%,transparent)] md:bg-[linear-gradient(to_right,rgb(12_11_10/0.92)_25%,rgb(12_11_10/0.45)_60%,transparent)]"
                />
                <div className="relative flex h-full max-w-2xl flex-col justify-end p-6 pb-16 text-white sm:p-10 sm:pb-16 md:justify-center md:p-16">
                  <p className="label-mono text-[#ff8a5c]">{slide.eyebrow}</p>
                  <h3 className="display mt-4 text-3xl leading-[1.02] font-semibold text-balance sm:text-5xl">
                    {slide.heading}
                  </h3>
                  <p className="mt-4 max-w-md text-lg text-white/80">{slide.body}</p>
                  <Link
                    href="#waitlist"
                    className="mt-7 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0c0b0a] transition-colors hover:bg-white/85"
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
                  className={`pointer-events-none absolute inset-0 bg-[#0c0b0a] transition-opacity duration-500 ${isActive ? "opacity-0" : "opacity-55"}`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Arrows on the edges of the current story (Adobe-style); phones swipe instead. */}
      <button
        type="button"
        onClick={() => scrollTo(active - 1)}
        aria-label={stories.previous}
        className="absolute top-1/2 left-[max(0.5rem,calc(var(--peek)_-_1.375rem))] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0c0b0a] shadow-lg shadow-black/40 transition-transform hover:scale-105 sm:flex"
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
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
        onClick={() => scrollTo(active + 1)}
        aria-label={stories.next}
        className="absolute top-1/2 right-[max(0.5rem,calc(var(--peek)_-_1.375rem))] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0c0b0a] shadow-lg shadow-black/40 transition-transform hover:scale-105 sm:flex"
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

      {/* Dots inside the bottom of the current story. Each is a 24 px target (WCAG 2.5.8). */}
      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center">
        <div className="flex items-center gap-1 rounded-full bg-black/45 px-2">
          {stories.slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={stories.goTo(index + 1, total)}
              aria-current={index === active ? "true" : undefined}
              className="group flex h-6 min-w-6 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all duration-300 ${index === active ? "w-6 bg-white" : "w-1.5 bg-white/55 group-hover:bg-white/85"}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
