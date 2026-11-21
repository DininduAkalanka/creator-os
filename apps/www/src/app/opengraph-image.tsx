import { ImageResponse } from "next/og";
import { BRAND } from "@/config/site";
import { hero } from "@/content/home";

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
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: 64,
            height: 64,
            borderRadius: 18,
            background: ACCENT,
          }}
        >
          <div style={{ width: 16, height: 22, borderRadius: 4, background: INK }} />
          <div style={{ width: 16, height: 22, borderRadius: 4, background: INK, opacity: 0.55 }} />
        </div>
        {BRAND.name}
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
