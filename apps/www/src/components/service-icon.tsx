import type { CSSProperties, ReactNode } from "react";
import type { ServiceIconName } from "@/content/services";

/*
 * CreatorOS service icons: our own pictograms, drawn for this site on a 24 px grid with the same
 * rounded line as the UI icons (icons.tsx), each on a round tile tinted in the service's colour.
 * No letters and no borrowed marks: v6.1's two-letter tiles followed the pattern of adobe.com's
 * product icons, which isn't ours to use.
 *
 * The tile and glyph colours switch with the nearest theme (light page or .theme-dark section):
 * see .service-icon in globals.css. Every glyph colour is at least 4.8:1 on its tile in both
 * themes (graphics need 3:1). Decorative: the service's name is always written next to the icon.
 */

type Tone = { fg: string; bg: string; fgDark: string; bgDark: string };

const TONES = {
  red: { fg: "#c8261d", bg: "#fdeaea", fgDark: "#ff8f8a", bgDark: "rgb(254 77 73 / 0.2)" },
  amber: { fg: "#8f5200", bg: "#fff1d6", fgDark: "#ffc24b", bgDark: "rgb(255 194 75 / 0.18)" },
  blue: { fg: "#0a5fb0", bg: "#e2f1ff", fgDark: "#7fd0ff", bgDark: "rgb(98 203 255 / 0.18)" },
  violet: { fg: "#5a42d6", bg: "#eeebff", fgDark: "#c4b9ff", bgDark: "rgb(185 173 255 / 0.2)" },
  green: { fg: "#0a6e4a", bg: "#dcf2e7", fgDark: "#6fe3b2", bgDark: "rgb(79 226 169 / 0.18)" },
  pink: { fg: "#ab1d6a", bg: "#ffe4f2", fgDark: "#ff9fd6", bgDark: "rgb(255 146 212 / 0.18)" },
  neutral: { fg: "#4b4a5e", bg: "#ebebf0", fgDark: "#d4d3df", bgDark: "rgb(255 255 255 / 0.12)" },
} satisfies Record<string, Tone>;

const fill = { fill: "currentColor", stroke: "none" } as const;
const tint = { fill: "currentColor", fillOpacity: 0.16 } as const;

const ICONS: Record<ServiceIconName, { tone: keyof typeof TONES; glyph: ReactNode }> = {
  // A waveform with a cut in it.
  "rough-cut": {
    tone: "red",
    glyph: (
      <>
        <path d="M3.25 10.5v3M6.25 7.25v9.5M9.25 9.25v5.5M17.75 8v8M20.75 10.5v3" />
        <path d="M11.5 15.75l1.75-7.5M14.5 15.75l1.75-7.5" opacity={0.55} />
      </>
    ),
  },
  // A frame with subtitle lines.
  captions: {
    tone: "amber",
    glyph: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" {...tint} />
        <path d="M7 12.75h4.5M13.75 12.75H17M8.5 15.75h7" />
      </>
    ),
  },
  // A clip leaving its frame, on its way to the creator's editor.
  export: {
    tone: "blue",
    glyph: (
      <>
        <path d="M11 4.5H6.5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V13" />
        <path d="M11.5 12.5l8-8M14.25 4.5h5.25v5.25" />
        <path d="M7.25 16.75h4" opacity={0.55} />
      </>
    ),
  },
  // A comment with a tick: notes on exact moments, then approval.
  review: {
    tone: "violet",
    glyph: (
      <>
        <path
          d="M6 4.5h12a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5h-6.25L7.5 20v-3H6a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5z"
          {...tint}
        />
        <path d="M8.75 10.75l2.25 2.25 4.25-4.5" />
      </>
    ),
  },
  // A trend line rising above the channel's usual range.
  audit: {
    tone: "green",
    glyph: (
      <>
        <rect
          x="4"
          y="9.5"
          width="16.5"
          height="5"
          rx="1"
          fill="currentColor"
          fillOpacity={0.18}
          stroke="none"
        />
        <path d="M3.5 4v16.5h17" />
        <path d="M7 16l3.5-4 3 2.25L18.5 7" />
      </>
    ),
  },
  // A play button with a spark: the next video's idea.
  next: {
    tone: "pink",
    glyph: (
      <>
        <circle cx="10.5" cy="13.5" r="7" />
        <path d="M9 10.75v5.5l4.5-2.75z" {...tint} />
        <path d="M18.5 2.5l.85 1.9 1.9.85-1.9.85-.85 1.9-.85-1.9-1.9-.85 1.9-.85z" {...fill} />
      </>
    ),
  },
  // Upload to the channel.
  publish: {
    tone: "neutral",
    glyph: (
      <>
        <path d="M12 15.5V4.5M7.75 8.75L12 4.5l4.25 4.25" />
        <path d="M4.5 14v3.5a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3V14" />
      </>
    ),
  },
  // A vertical video.
  shorts: {
    tone: "neutral",
    glyph: (
      <>
        <rect x="7" y="2.75" width="10" height="18.5" rx="2.5" />
        <path d="M10.75 9.5v5l4-2.5z" {...tint} />
      </>
    ),
  },
  // A film strip.
  broll: {
    tone: "neutral",
    glyph: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="M8 5v14M16 5v14" />
        <path d="M3.5 9.5H8M3.5 14.5H8M16 9.5h4.5M16 14.5h4.5" opacity={0.55} />
      </>
    ),
  },
  // A target: how the video did against the usual range.
  outcomes: {
    tone: "neutral",
    glyph: (
      <>
        <circle cx="12" cy="12" r="8.25" />
        <circle cx="12" cy="12" r="4.5" opacity={0.55} />
        <circle cx="12" cy="12" r="1.25" {...fill} />
      </>
    ),
  },
  // A bookmark holding a star: what the creator prefers, remembered.
  memory: {
    tone: "neutral",
    glyph: (
      <>
        <path d="M7 3.5h10A1.5 1.5 0 0 1 18.5 5v15.5L12 16.5l-6.5 4V5A1.5 1.5 0 0 1 7 3.5z" />
        <path
          d="M12 7.25l.95 1.95 2.15.3-1.55 1.5.35 2.15L12 12.15l-1.9 1 .35-2.15L8.9 9.5l2.15-.3z"
          {...fill}
        />
      </>
    ),
  },
  // A cloud that renders the video.
  render: {
    tone: "neutral",
    glyph: (
      <>
        <path d="M7.25 18.5a4.25 4.25 0 0 1-.55-8.46 5.5 5.5 0 0 1 10.6-1.04 4.75 4.75 0 0 1-.55 9.5z" />
        <path d="M10.75 11.25v4.5l3.75-2.25z" {...tint} />
      </>
    ),
  },
};

/** Tile size, glyph size and line weight (thicker when drawn small, so it stays crisp). */
const SIZES = {
  xs: { tile: "size-5", glyph: "size-3", stroke: 2.25 },
  sm: { tile: "size-7", glyph: "size-4", stroke: 2 },
  md: { tile: "size-9", glyph: "size-5", stroke: 1.85 },
  lg: { tile: "size-10", glyph: "size-[1.375rem]", stroke: 1.75 },
  xl: { tile: "size-14", glyph: "size-8", stroke: 1.6 },
} as const;

export function ServiceIcon({
  name,
  size = "md",
  className = "",
}: {
  name: ServiceIconName;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const icon = ICONS[name];
  const tone = TONES[icon.tone];
  const dims = SIZES[size];
  const style = {
    "--si-fg": tone.fg,
    "--si-bg": tone.bg,
    "--si-fg-dark": tone.fgDark,
    "--si-bg-dark": tone.bgDark,
  } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`service-icon inline-flex shrink-0 items-center justify-center rounded-full ${dims.tile} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={dims.glyph}
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth={dims.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.glyph}
      </svg>
    </span>
  );
}
