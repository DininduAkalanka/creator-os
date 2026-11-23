"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * adobe.com's header, in two states:
 * - At the top of the home page it is no bar at all: white type straight on the hero's media
 *   (the "header-overlay" colours in globals.css).
 * - Once the page scrolls (and on every other page) it is a floating white bar with rounded
 *   corners, slightly translucent with a blur, so over a dark section it reads as frosted glass.
 * While a menu is open the bar is solid white, whatever the scroll position.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const home = usePathname() === "/";
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

  const overlay = home && !scrolled;

  return (
    <header data-overlay={overlay} className="sticky top-0 z-40 px-2 pt-2 sm:px-3">
      <div
        className={`mx-auto max-w-[100rem] rounded-2xl border transition-[background-color,box-shadow,border-color,color] duration-300 has-[[aria-expanded=true]]:border-line has-[[aria-expanded=true]]:bg-bg has-[[aria-expanded=true]]:shadow-float ${
          overlay
            ? "header-overlay border-transparent bg-transparent"
            : scrolled
              ? "border-line bg-bg/85 shadow-float backdrop-blur-xl backdrop-saturate-150"
              : "border-line bg-bg shadow-soft"
        }`}
      >
        {children}
      </div>
    </header>
  );
}
