"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { services, statusHelp, statusLabels, type ServiceStatus } from "@/content/services";
import { swipeStep } from "@/lib/motion";
import { AppIcon } from "./app-icon";
import { ArrowRightIcon, PauseIcon, PlayIcon } from "./icons";

export type SwitcherItem = {
  id: string;
  mark: string;
  title: string;
  body: string;
  status: ServiceStatus;
  href: string;
  /** The product screen drawn for this service (decorative; the caption says the same). */
  visual: ReactNode;
};

const STEP_MS = 6500;

/** A soft backdrop per service, in the colour of its app icon. */
const BACKDROPS: Record<string, string> = {
  Rc: "radial-gradient(60% 80% at 90% 0%, rgb(255 107 102 / 0.32), transparent 70%), linear-gradient(160deg, #fff5f4, #ffe8e6)",
  Cc: "radial-gradient(60% 80% at 90% 0%, rgb(255 194 75 / 0.38), transparent 70%), linear-gradient(160deg, #fffaf0, #fff0d4)",
  Ex: "radial-gradient(60% 80% at 90% 0%, rgb(98 203 255 / 0.36), transparent 70%), linear-gradient(160deg, #f4fbff, #e1f3ff)",
  Rv: "radial-gradient(60% 80% at 90% 0%, rgb(185 173 255 / 0.4), transparent 70%), linear-gradient(160deg, #f8f6ff, #ebe7ff)",
  Au: "radial-gradient(60% 80% at 90% 0%, rgb(79 226 169 / 0.34), transparent 70%), linear-gradient(160deg, #f3fcf8, #dcf6ea)",
  Nx: "radial-gradient(60% 80% at 90% 0%, rgb(255 146 212 / 0.34), transparent 70%), linear-gradient(160deg, #fff5fb, #ffe4f3)",
};

const statusTone: Record<ServiceStatus, string> = {
  first: "text-keep",
  beta: "text-accent",
  later: "text-faint",
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const motionAllowedNow = () =>
  !window.matchMedia(reducedMotionQuery).matches &&
  !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
// On the server nothing moves: the tour starts only once the page is interactive.
const motionAllowedOnServer = () => false;

const largeScreen = "(min-width: 64rem)";
function subscribeLarge(onChange: () => void) {
  const query = window.matchMedia(largeScreen);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The services as a guided tour (adobe.com-style feature tabs): the list of services beside a
 * stage (a row of chips above it on phones). The stage shows the selected service's product
 * screen and its description. Nothing is truncated: every tab shows its full name.
 *
 * It moves on by itself while it is mostly on screen, with the time shown in the active tab, and
 * holds while the mouse is over it or keyboard focus is inside (WCAG 2.2.2: there is a pause
 * button). Choosing a service by click, key or swipe stops the tour for good. Nothing moves for
 * reduced-motion or data-saver visitors.
 *
 * The stage never changes height: every service's panel is laid out in the same grid cell and
 * only the selected one is visible, so the stage is always as tall as the tallest panel.
 *
 * Accessibility (WAI-ARIA APG tabs, automatic activation): arrow keys in either direction, Home
 * and End; one tabpanel shows the selected service (the hidden panels are inert); changes are
 * announced only while the tour is not running. The product screens are decorative.
 */
export function ServiceSwitcher({ items }: { items: SwitcherItem[] }) {
  const copy = services.switcher;
  const baseId = useId();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [pointerHold, setPointerHold] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const swipeStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const motionAllowed = useSyncExternalStore(
    subscribeMotion,
    motionAllowedNow,
    motionAllowedOnServer,
  );
  const large = useSyncExternalStore(
    subscribeLarge,
    () => window.matchMedia(largeScreen).matches,
    () => true,
  );
  const total = items.length;

  // Run the tour only while at least half of it is on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.5 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // On phones the chips scroll sideways: keep the active one in view (the row only, not the page).
  useEffect(() => {
    const tab = tabRefs.current[active];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - list.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left >= list.scrollLeft && right <= list.scrollLeft + list.clientWidth) return;
    const reduced = window.matchMedia(reducedMotionQuery).matches;
    list.scrollTo({ left: left - 8, behavior: reduced ? "auto" : "smooth" });
  }, [active]);

  const rotating = motionAllowed && playing && inView && !pointerHold && !focusHold;

  /** A choice by the visitor: show that service and stop the tour. */
  function choose(index: number, focus = false) {
    const next = (index + total) % total;
    setActive(next);
    setPlaying(false);
    if (focus) tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: total - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    choose(target, true);
  }

  // Keyboard focus holds the tour; a mouse click on a tab stops it anyway (see choose).
  function onFocus(event: FocusEvent<HTMLElement>) {
    if (event.target.matches(":focus-visible")) setFocusHold(true);
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusHold(false);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = swipeStep(event.clientX - start.x, event.clientY - start.y, rtl);
    if (step !== 0) choose(active + step);
  }

  const panelId = `${baseId}-panel`;

  return (
    <div
      ref={rootRef}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setPointerHold(true);
      }}
      onPointerLeave={() => setPointerHold(false)}
      className="grid gap-2.5 rounded-[2.25rem] bg-raised p-2.5 sm:p-3 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-3"
    >
      {/* The list (a row of chips on phones), then the status note and the tour control. */}
      <div className="flex min-w-0 items-center gap-2 lg:flex-col lg:items-stretch lg:gap-0">
        <div
          role="tablist"
          aria-label={copy.label}
          aria-orientation={large ? "vertical" : "horizontal"}
          className="-ms-2.5 flex min-w-0 flex-1 gap-1.5 overflow-x-auto ps-2.5 pb-0.5 [scrollbar-width:none] sm:-ms-3 sm:ps-3 lg:ms-0 lg:flex-none lg:flex-col lg:gap-1 lg:overflow-visible lg:p-1.5 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => {
            const isActive = index === active;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${baseId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`relative flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl py-2.5 ps-2.5 pe-4 text-left transition-[background-color,box-shadow] duration-300 lg:w-full lg:py-3 lg:ps-3 ${
                  isActive ? "bg-bg shadow-float" : "hover:bg-bg/60"
                }`}
              >
                <AppIcon mark={item.mark} size="md" />
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] leading-tight font-bold whitespace-nowrap lg:text-base lg:whitespace-normal">
                    {item.title}
                  </span>
                  <span
                    className={`detail mt-1 hidden text-[0.625rem] lg:block ${statusTone[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </span>
                {isActive && motionAllowed && playing && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-1.5 h-[3px] overflow-hidden rounded-full bg-line"
                  >
                    <span
                      key={active}
                      onAnimationEnd={() => setActive((value) => (value + 1) % total)}
                      style={{
                        animationDuration: `${STEP_MS}ms`,
                        animationPlayState: rotating ? "running" : "paused",
                      }}
                      className="tab-progress block h-full rounded-full bg-brand"
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-end gap-4 lg:mt-auto lg:justify-between lg:p-4 lg:pt-6">
          <p className="hidden text-sm leading-relaxed text-muted lg:block">{statusHelp}</p>
          {motionAllowed && (
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? copy.pause : copy.play}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-fg transition-colors hover:border-line-strong"
            >
              {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
            </button>
          )}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        aria-live={rotating ? "off" : "polite"}
        data-service-stage=""
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
        className="relative isolate grid touch-pan-y overflow-hidden rounded-[1.75rem] p-5 sm:p-8 lg:p-10"
      >
        {/* Backdrops crossfade: one per service, in the colour of its icon. */}
        {items.map((item, index) => (
          <div
            key={item.id}
            aria-hidden="true"
            style={{ background: BACKDROPS[item.mark] ?? BACKDROPS.Rc }}
            className={`absolute inset-0 -z-10 transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Every panel in the same cell; only the selected one is visible. */}
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`col-start-1 row-start-1 flex flex-col justify-between gap-8 ${isActive ? "visible" : "invisible"}`}
            >
              {/* The product screen: a dark app window, as the product itself is an editor. */}
              <div
                aria-hidden="true"
                className={`flex justify-center ${isActive ? "switch-in" : ""}`}
              >
                <div className="theme-dark w-full max-w-[34rem] overflow-hidden rounded-2xl border border-white/10 bg-[#121218] shadow-lift">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="hidden gap-1.5 sm:flex">
                        <span className="size-2.5 rounded-full bg-white/20" />
                        <span className="size-2.5 rounded-full bg-white/20" />
                        <span className="size-2.5 rounded-full bg-white/20" />
                      </span>
                      <AppIcon mark={item.mark} size="sm" className="sm:ms-2" />
                      <span className="truncate text-sm font-bold text-fg">{item.title}</span>
                    </div>
                    <span className="detail shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[0.5625rem] text-faint">
                      {copy.example}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">{item.visual}</div>
                </div>
              </div>

              <div className={`max-w-xl ${isActive ? "switch-in-late" : ""}`}>
                <p className={`detail ${statusTone[item.status]}`}>{statusLabels[item.status]}</p>
                <h3 className="display mt-2 text-3xl leading-[1.05] font-extrabold tracking-[-0.02em] sm:text-4xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-pretty text-muted">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-2 font-bold text-fg underline decoration-fg/25 underline-offset-4 transition-colors hover:decoration-fg"
                >
                  {copy.more(item.title)}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
