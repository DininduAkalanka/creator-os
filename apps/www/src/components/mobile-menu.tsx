"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { siteCopy } from "@/content/site";
import { buttonPrimary } from "./styles";

/** Small-screen navigation: a disclosure button that opens the links below the header. */
export function MobileMenu({ links }: { links: Array<{ href: string; label: string }> }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-full border border-line-strong text-fg"
      >
        <span className="sr-only">{open ? siteCopy.nav.closeMenu : siteCopy.nav.openMenu}</span>
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true" fill="none">
          {open ? (
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M3 7h14M3 13h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-bg px-4 pt-2 pb-6 shadow-2xl shadow-black/60"
      >
        <ul className="divide-y divide-line">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="display block py-4 text-2xl font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/#waitlist"
          onClick={() => setOpen(false)}
          className={`${buttonPrimary} mt-4 w-full py-3.5 text-base`}
        >
          {siteCopy.nav.cta}
        </Link>
      </div>
    </div>
  );
}
