"use client";

import { useEffect, useRef, useState } from "react";
import { siteCopy } from "@/content/site";

type Status = "waiting" | "playing" | "paused";

/**
 * A muted, looping, decorative video laid over its poster image.
 *
 * Loading follows adobe.com's rules (aem.live "Keeping it 100"): nothing video-related loads
 * before the page has painted; the poster (rendered by the parent with next/image) is what the
 * visitor sees first. The video is skipped entirely for reduced-motion or data-saver visitors.
 * It pauses when scrolled out of view, and always has a pause button (WCAG 2.2.2).
 */
export function BackgroundVideo(props: {
  sources: Array<{ src: string; media?: string }>;
  /** "load": after the page has loaded (hero). "visible": when scrolled into view. */
  start: "load" | "visible";
  className?: string;
  buttonClassName?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("waiting");
  const [enabled, setEnabled] = useState(false);
  // True once a frame has played: from then on a pause freezes the frame instead of hiding it.
  const [shown, setShown] = useState(false);
  // A pause chosen by the visitor wins over automatic play/pause on scroll.
  const userPaused = useRef(false);

  // Decide whether to load the video at all, and when.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (reducedMotion || connection?.saveData) return;

    let cancelled = false;
    let idleId: number | undefined;
    const enable = () => {
      if (!cancelled) setEnabled(true);
    };
    const afterLoad = () => {
      if (typeof window.requestIdleCallback === "function")
        idleId = window.requestIdleCallback(enable, { timeout: 2500 });
      else idleId = window.setTimeout(enable, 1500);
    };

    if (props.start === "load") {
      if (document.readyState === "complete") afterLoad();
      else window.addEventListener("load", afterLoad, { once: true });
    } else {
      afterLoad();
    }
    return () => {
      cancelled = true;
      window.removeEventListener("load", afterLoad);
      if (idleId !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
        window.clearTimeout(idleId);
      }
    };
  }, [props.start]);

  // Once enabled: play while on screen, pause while off screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video) return;
    // No explicit load(): preload="none" means nothing downloads until play() runs on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !userPaused.current) {
          video.play().then(
            () => {
              setStatus("playing");
              setShown(true);
            },
            () => setStatus("paused"),
          );
        } else if (!entry.isIntersecting && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [enabled]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().then(
        () => {
          setStatus("playing");
          setShown(true);
        },
        () => setStatus("paused"),
      );
    } else {
      userPaused.current = true;
      video.pause();
      setStatus("paused");
    }
  }

  const label = status === "playing" ? siteCopy.video.pause : siteCopy.video.play;

  return (
    <>
      {enabled && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className={`transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"} ${props.className ?? ""}`}
        >
          {props.sources.map((source) => (
            <source key={source.src} src={source.src} media={source.media} type="video/mp4" />
          ))}
        </video>
      )}
      {enabled && status !== "waiting" && (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          className={`flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 ${props.buttonClassName ?? ""}`}
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="currentColor">
            {status === "playing" ? (
              <path d="M4 3h3v10H4zM9 3h3v10H9z" />
            ) : (
              <path d="M5 3l8 5-8 5z" />
            )}
          </svg>
        </button>
      )}
    </>
  );
}
