"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { stories } from "@/content/services";
import { siteCopy } from "@/content/site";

/**
 * Full-width story slider modelled on adobe.com's testimonial carousel, without testimonials:
 * use-case statements over AI-generated photos (labelled). Built on native scroll-snap, so it
 * swipes on touch, scrolls with a trackpad and needs no auto-rotation (nothing moves by itself).
 */
export function StoryCarousel({ images }: { images: Record<string, StaticImageData> }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const total = stories.slides.length;

  // Keep the dots in sync with whatever the visitor scrolled to.
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
    track.querySelectorAll("li").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  function scrollTo(index: number) {
    const track = trackRef.current;
    const slide = track?.children[(index + total) % total] as HTMLElement | undefined;
    if (!track || !slide) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        aria-label={stories.label}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {stories.slides.map((slide, index) => {
          const image = images[slide.key];
          return (
            <li
              key={slide.key}
              data-index={index}
              aria-label={`${index + 1} / ${total}`}
              className="relative w-full shrink-0 snap-center overflow-hidden rounded-[1.5rem] border border-line"
            >
              <div className="relative h-[34rem] sm:h-[38rem]">
                {image && (
                  <Image
                    src={image}
                    alt={slide.imageAlt}
                    sizes="100vw"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgb(12_11_10/0.95)_15%,rgb(12_11_10/0.4)_60%,transparent)] md:bg-[linear-gradient(to_right,rgb(12_11_10/0.92)_25%,rgb(12_11_10/0.45)_60%,transparent)]"
                />
                <div className="relative flex h-full max-w-2xl flex-col justify-end p-6 text-white sm:p-10 md:justify-center md:p-14">
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
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollTo(active - 1)}
          aria-label={stories.previous}
          className="flex size-11 items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:bg-panel"
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
        <div className="flex gap-2" aria-hidden="true">
          {stories.slides.map((slide, index) => (
            <span
              key={slide.key}
              className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-accent" : "w-1.5 bg-line-strong"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollTo(active + 1)}
          aria-label={stories.next}
          className="flex size-11 items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:bg-panel"
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
  );
}
