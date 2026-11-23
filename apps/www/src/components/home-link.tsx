"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

/**
 * The header logo's link home. Like adobe.com's logo, it always gives you the home page afresh:
 * at the top, with the slideshow on its first slide.
 *
 * - From another page, Next.js navigates to a freshly mounted home page (at the top, thanks to
 *   data-scroll-behavior on <html>, see layout.tsx).
 * - On the home page itself, a Next.js Link to the page you are on does nothing, so the logo
 *   looked broken. Here a plain click reloads the page, after dropping any #section from the
 *   address and going to the top, so the reload starts there (a reload keeps the scroll
 *   position).
 * Clicks with a modifier key or another mouse button (new tab, new window) keep the browser's
 * own behaviour.
 */
export function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.location.pathname !== "/") return;
    event.preventDefault();
    window.history.replaceState(window.history.state, "", "/");
    window.scrollTo({ top: 0, behavior: "instant" });
    window.location.reload();
  }

  return (
    <Link href="/" onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
