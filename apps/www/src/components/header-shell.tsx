"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Adobe-style header: on the home page it sits transparent over the hero, then turns into a
 * floating, frosted, rounded bar once the page scrolls. On other pages it is solid from the start.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const overlay = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  const floating = scrolled;
  const transparent = overlay && !scrolled;

  return (
    <header
      className={`sticky top-0 z-40 transition-[padding] duration-300 ${floating ? "px-2 pt-2 sm:px-4" : ""}`}
    >
      <div
        className={`mx-auto transition-all duration-300 ${
          floating
            ? "max-w-7xl rounded-2xl border border-line-strong bg-bg/75 shadow-2xl shadow-black/40 backdrop-blur-xl backdrop-saturate-150"
            : transparent
              ? "border-b border-transparent bg-transparent"
              : "border-b border-line bg-bg/90 backdrop-blur-xl"
        }`}
      >
        {children}
      </div>
    </header>
  );
}
