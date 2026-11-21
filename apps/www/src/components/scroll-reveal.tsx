"use client";

import { useEffect } from "react";
import { revealDelay } from "@/lib/motion";

/**
 * Adobe-style scroll reveal: every `.reveal` element below the first screen rises in once as it
 * scrolls into view; items that arrive together (a row of cards) rise one after another.
 *
 * Safe by design:
 * - Only elements that start below the viewport are ever hidden, so nothing on the first screen
 *   blinks and the main paint (LCP) is untouched.
 * - Without JavaScript, or with reduced motion, nothing is hidden at all.
 * - Each element animates once; then its attribute is removed and its own styles apply again.
 *
 * Cheap by design: one IntersectionObserver, no scroll listeners. Positions come from the
 * observer's first report, which the browser computes after its own layout, and each callback
 * reads before it writes, so the page is laid out once per report, not once per element.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const cleanups: Array<() => void> = [];
    const placed = new WeakSet<Element>();

    const reveal = (element: HTMLElement, order: number) => {
      element.style.setProperty("--reveal-delay", `${revealDelay(order)}ms`);
      element.dataset.reveal = "in";
      const finish = (event: TransitionEvent) => {
        if (event.target !== element || event.propertyName !== "transform") return;
        element.removeEventListener("transitionend", finish);
        delete element.dataset.reveal;
        element.style.removeProperty("--reveal-delay");
      };
      element.addEventListener("transitionend", finish);
      cleanups.push(() => element.removeEventListener("transitionend", finish));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Read everything first. Reading the scroll position or page height after hiding an
        // element makes the browser lay out the page again (measured: one layout per element).
        const fold = window.innerHeight;
        const scrolled = window.scrollY;
        // Anything this close to the end of the page could never cross the line: leave it be.
        const lastTop = document.documentElement.scrollHeight - fold * 0.1 - scrolled;
        let order = 0;
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (!placed.has(element)) {
            // First report: hide it only if it starts below the screen and can be scrolled to.
            placed.add(element);
            const top = entry.boundingClientRect.top;
            if (entry.isIntersecting || top <= fold || top >= lastTop) {
              observer.unobserve(element);
            } else {
              element.dataset.reveal = "wait";
            }
            continue;
          }
          if (!entry.isIntersecting) continue;
          observer.unobserve(element);
          reveal(element, order++);
        }
      },
      // Start once the element's place is a little inside the screen, so the whole rise is seen.
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const element of document.querySelectorAll(".reveal")) observer.observe(element);

    return () => {
      observer.disconnect();
      for (const cleanup of cleanups) cleanup();
      // Leave nothing hidden when the page unmounts or reloads in development.
      for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
        delete element.dataset.reveal;
        element.style.removeProperty("--reveal-delay");
      }
    };
  }, []);

  return null;
}
