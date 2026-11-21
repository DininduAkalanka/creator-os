import { ImageResponse } from "next/og";
import { LOGO_FULL } from "@/components/brand-paths";
import { LOGO_ACCENT } from "@/components/logo";
import { BRAND } from "@/config/site";
import { hero } from "@/content/home";

const LOGO_HEIGHT = 72;

export const alt = `${BRAND.name}: ${hero.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0c0b0a";
const FG = "#f4efe6";
const MUTED = "#a8a095";
const ACCENT = "#ff5a1f";

/** Social preview card, generated at build time with the built-in font (no network). */
export default function OpenGraphImage() {
  const bars = [30, 55, 80, 45, 70, 90, 40, 20, 8, 8, 8, 35, 75, 60, 85, 50, 30, 65, 95, 55];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `radial-gradient(60% 70% at 90% 0%, rgba(255,90,31,0.28), transparent 70%), ${INK}`,
        color: FG,
      }}
    >
      {/* The logo, light ink for the dark card; the red accent keeps the logo's red. */}
      <div style={{ display: "flex" }}>
        <svg
          width={Math.round((LOGO_HEIGHT * LOGO_FULL.width) / LOGO_FULL.height)}
          height={LOGO_HEIGHT}
          viewBox={`0 0 ${LOGO_FULL.width} ${LOGO_FULL.height}`}
        >
          <path fill={FG} fillRule="evenodd" d={LOGO_FULL.ink} />
          <path fill={LOGO_ACCENT} fillRule="evenodd" d={LOGO_FULL.accent} />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          fontSize: 78,
          lineHeight: 1.05,
          letterSpacing: -2.5,
          maxWidth: 1000,
        }}
      >
        <span style={{ marginRight: 22 }}>{hero.headlineBefore}</span>
        <span
          style={{
            marginRight: 22,
            color: ACCENT,
            textDecoration: "line-through",
            textDecorationColor: ACCENT,
          }}
        >
          {hero.headlineCut}
        </span>
        <span>{hero.headlineAfter}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>{hero.exportLine}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, height: 60 }}>
          {bars.map((height, index) => (
            <div
              key={index}
              style={{
                width: 7,
                height: `${height}%`,
                borderRadius: 4,
                background: index >= 7 && index <= 10 ? ACCENT : "rgba(244,239,230,0.45)",
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
