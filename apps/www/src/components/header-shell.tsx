"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * adobe.com-style header: a floating white bar with rounded corners, on every page and from the
 * first paint (the page is white, so nothing needs to sit transparent over a dark hero). Once
 * the page scrolls, it turns slightly translucent with a deeper shadow; over a dark section it
 * reads as frosted glass, like adobe.com's.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-3">
      {/* While a menu is open the bar turns solid (adobe.com), whatever the scroll position. */}
      <div
        className={`mx-auto max-w-[100rem] rounded-2xl border transition-[background-color,box-shadow,border-color] duration-300 has-[[aria-expanded=true]]:bg-bg ${
          scrolled
            ? "border-line bg-bg/85 shadow-float backdrop-blur-xl backdrop-saturate-150"
            : "border-line bg-bg shadow-soft"
        }`}
      >
        {children}
      </div>
    </header>
  );
}
