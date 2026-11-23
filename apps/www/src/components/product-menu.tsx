"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { productMenu, statusLabels, type MenuItem, type ServiceStatus } from "@/content/services";
import { ChevronDownIcon, ChevronRightIcon } from "./icons";
import { ServiceIcon } from "./service-icon";

// Same colours as the status pills on the page: first release green, beta red, later neutral.
const pillTone: Record<ServiceStatus, string> = {
  first: "border-keep/50 text-keep",
  beta: "border-accent/50 text-accent",
  later: "border-line-strong text-faint",
};

/**
 * "Product" menu modelled on adobe.com's Products menu: a button in the header opens a large
 * panel with product areas on the left (pills) and service cards on the right, and the page
 * behind dims. Only real services are listed, each with its honest status.
 *
 * Accessibility (WAI-ARIA APG disclosure navigation): the button has aria-expanded; the areas are
 * a vertical tablist (arrow keys, Home, End); Escape closes and returns focus to the button; so
 * do a click outside and tabbing out of the menu.
 */
export function ProductMenu() {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState(0);
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const areas = productMenu.areas;
  const current = areas[area] ?? areas[0];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    // Click, not pointerdown: a pointerdown close would let the same click land on the page below.
    function onClick(event: MouseEvent) {
      if (event.target instanceof Node && wrapperRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  function toggle() {
    if (!open) setArea(0);
    setOpen(!open);
  }

  // Keyboard users tabbing out of the menu close it. (A click on empty space has no related target.)
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (next && !event.currentTarget.contains(next)) setOpen(false);
  }

  function onAreaKeyDown(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: areas.length - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + areas.length) % areas.length;
    setArea(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div ref={wrapperRef} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors hover:bg-raised hover:text-fg ${open ? "bg-raised text-fg" : "text-fg/85"}`}
      >
        {productMenu.label}
        <ChevronDownIcon
          className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="menu-in absolute inset-x-0 top-[calc(100%_+_0.5rem)] z-10 rounded-2xl border border-line bg-bg p-3 text-left font-normal shadow-lift sm:p-4"
      >
        <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
          <div className="flex flex-col gap-4 p-1">
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label={productMenu.areasLabel}
              className="flex flex-col items-start gap-1.5"
            >
              {areas.map((item, index) => {
                const selected = index === area;
                return (
                  <button
                    key={item.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={`${baseId}-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`${baseId}-cards`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setArea(index)}
                    onKeyDown={(event) => onAreaKeyDown(event, index)}
                    className={`rounded-full px-4 py-2 text-[0.9375rem] font-bold transition-colors ${
                      selected ? "bg-ink text-on-ink" : "bg-raised text-fg/85 hover:bg-panel"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <Link
              href={productMenu.all.href}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 px-4 text-[0.9375rem] font-bold text-fg hover:text-accent"
            >
              {productMenu.all.label}
              <ChevronRightIcon className="size-4" />
            </Link>
          </div>

          <div
            id={`${baseId}-cards`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${current?.id}`}
          >
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {current?.items.map((item) => (
                <li key={item.id}>
                  <MenuCard item={item} onNavigate={() => setOpen(false)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The page behind dims (adobe.com). In a portal: the floating header's backdrop blur
          would otherwise trap a fixed overlay inside the header. */}
      {open &&
        createPortal(
          <div
            aria-hidden="true"
            className="menu-dim fixed inset-0 z-30 hidden bg-black/40 lg:block"
          />,
          document.body,
        )}
    </div>
  );
}

function MenuCard({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group flex h-full min-h-40 flex-col rounded-xl border border-transparent bg-raised p-4 transition-colors hover:border-line hover:bg-panel"
    >
      <span className="flex items-center justify-between gap-3">
        <ServiceIcon name={item.icon} size="lg" />
        <span
          className={`detail rounded-full border px-2 py-0.5 text-[0.625rem] ${pillTone[item.status]}`}
        >
          {statusLabels[item.status]}
        </span>
      </span>
      <span className="mt-auto block pt-6 text-[1.0625rem] font-bold text-fg">{item.title}</span>
      <span className="mt-1 line-clamp-2 block text-sm text-muted">{item.body}</span>
    </Link>
  );
}
