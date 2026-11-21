"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { statusLabels, type ServiceStatus } from "@/content/services";
import { AppIcon } from "./app-icon";
import { ChevronRightIcon } from "./icons";

export type RailItem = {
  id: string;
  /** Two-letter tile, in the spirit of app icons. */
  mark: string;
  title: string;
  body: string;
  status: ServiceStatus;
  href: string;
  visual: ReactNode;
};

// Same colours as the status pills elsewhere: first release green, beta red, later neutral.
const pillTone: Record<ServiceStatus, string> = {
  first: "border-keep/50 text-keep",
  beta: "border-accent/50 text-accent",
  later: "border-line-strong text-faint",
};

/**
 * "Everything you need" row, modelled on adobe.com's homepage. On large screens the cards sit
 * side by side; the one the mouse rests on (or keyboard focus reaches) opens wide and turns navy
 * while the others narrow, and the first one is open to begin with. On phones and tablets it is
 * a row of full cards that scrolls sideways and snaps to each card.
 *
 * Every card is a plain link with all of its text in the page, so the opening is visual only:
 * screen readers and keyboards get the same list either way. Opening waits a moment, so sweeping
 * the mouse across the row doesn't flick every card open on the way.
 */
export function ServiceRail({ items }: { items: RailItem[] }) {
  const [open, setOpen] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function openSoon(index: number) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(index), 90);
  }

  return (
    <ul
      onPointerLeave={() => window.clearTimeout(timer.current)}
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:h-[34rem] lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item, index) => {
        const isOpen = index === open;
        return (
          <li
            key={item.id}
            data-open={isOpen}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") openSoon(index);
            }}
            onFocus={() => setOpen(index)}
            className="reveal w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-auto lg:min-w-0 lg:flex-[1_1_0%] lg:transition-[flex-grow] lg:duration-700 lg:ease-out-expo lg:data-[open=true]:flex-[3.2_1_0%]"
          >
            <Link
              href={item.href}
              className={`group flex h-full flex-col overflow-hidden rounded-[1.75rem] p-2 transition-colors duration-500 ${
                isOpen ? "theme-dark bg-navy" : "bg-raised hover:bg-panel"
              }`}
            >
              <div className="flex items-center gap-3 px-3 pt-3 pb-4">
                <AppIcon mark={item.mark} size="md" />
                <h3 className="min-w-0 text-[1.0625rem] leading-tight font-bold lg:truncate">
                  {item.title}
                </h3>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] lg:aspect-auto lg:min-h-0 lg:flex-1">
                {item.visual}
              </div>
              <div className="flex items-end justify-between gap-4 px-3 pt-4 pb-3">
                <div className="min-w-0">
                  <span
                    className={`detail inline-block rounded-full border px-2 py-0.5 text-[0.625rem] whitespace-nowrap ${pillTone[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                  <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-snug text-muted">
                    {item.body}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink transition-transform duration-300 group-hover:translate-x-0.5 ${
                    isOpen ? "" : "lg:hidden"
                  }`}
                >
                  <ChevronRightIcon className="size-5" />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
