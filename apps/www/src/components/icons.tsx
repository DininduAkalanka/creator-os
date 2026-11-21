import type { ReactNode } from "react";

/*
 * The site's UI icons: one family, drawn on a 20 px grid with rounded line ends, in the spirit of
 * adobe.com's interface icons (simple, geometric, the same stroke everywhere). They replace text
 * characters such as → › ↺ +, which every font draws differently. All are decorative
 * (aria-hidden): the control around them carries the accessible name.
 */

type IconProps = { className?: string };

function Line({
  className = "size-5",
  strokeWidth = 1.75,
  children,
}: IconProps & { strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Solid({ className = "size-5", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Line className={className} strokeWidth={2}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </Line>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <Line className={className} strokeWidth={2}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </Line>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Line className={className}>
      <path d="M5 5l10 10M15 5L5 15" />
    </Line>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Line className={className}>
      <path d="M3.5 7h13M3.5 13h13" />
    </Line>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Line className={className}>
      <path d="M5.5 8l4.5 4.5L14.5 8" />
    </Line>
  );
}

/** Points to the inline end: flips in right-to-left text. */
export function ChevronRightIcon({ className = "size-5" }: IconProps) {
  return (
    <Line className={`${className} rtl:-scale-x-100`}>
      <path d="M8 5.5l4.5 4.5L8 14.5" />
    </Line>
  );
}

/** Points to the inline start: flips in right-to-left text. */
export function ChevronLeftIcon({ className = "size-5" }: IconProps) {
  return (
    <Line className={`${className} rtl:-scale-x-100`}>
      <path d="M12 5.5L7.5 10l4.5 4.5" />
    </Line>
  );
}

/** Points to the inline end: flips in right-to-left text. */
export function ArrowRightIcon({ className = "size-5" }: IconProps) {
  return (
    <Line className={`${className} rtl:-scale-x-100`}>
      <path d="M4 10h12M11 5l5 5-5 5" />
    </Line>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Line className={className}>
      <path d="M10 4.5v11M4.5 10h11" />
    </Line>
  );
}

/** A loop (the product's cycle: film, cut, learn, film again). */
export function LoopIcon({ className }: IconProps) {
  return (
    <Line className={className}>
      <path d="M15.6 9.2a5.6 5.6 0 1 1-1.9-3.8" />
      <path d="M15.8 3.8v3.4h-3.4" />
    </Line>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Solid className={className}>
      <path d="M6.5 4.6c0-.8.9-1.3 1.6-.9l8.2 5.4c.6.4.6 1.3 0 1.7l-8.2 5.4c-.7.4-1.6-.1-1.6-.9V4.6z" />
    </Solid>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <Solid className={className}>
      <rect x="5" y="4" width="3.5" height="12" rx="1" />
      <rect x="11.5" y="4" width="3.5" height="12" rx="1" />
    </Solid>
  );
}
