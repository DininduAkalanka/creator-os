"use client";

import { useEffect } from "react";

/**
 * Section links always work, also the second time. A Next.js Link to the address you are already
 * on (say "/#plans" while the address is "/#plans") does nothing, so "Plans" or "Join early
 * access" looked broken once you had scrolled away from the section they had taken you to.
 *
 * One listener for the whole site: when a Next.js Link has taken over a click (it prevents the
 * browser's default) and the link points at the current page and the current #section, this
 * scrolls that section into view, as a browser does for a plain link. Plain links, new-tab clicks
 * and links to anything else are left alone. It listens on window, so Next.js has already seen
 * the click.
 */
export function SectionLinkScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      const here = window.location;
      if (url.origin !== here.origin || url.pathname !== here.pathname) return;
      if (url.search !== here.search || !url.hash || url.hash !== here.hash) return;
      const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!section) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return null;
}
