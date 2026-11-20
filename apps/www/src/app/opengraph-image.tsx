import { ImageResponse } from "next/og";
import { BRAND } from "@/config/site";
import { hero } from "@/content/home";

export const alt = `${BRAND.name}: ${hero.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card, generated at build time with the built-in font (no network). */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#faf9f7",
        color: "#17161c",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "#c2410c",
          }}
        >
          <div style={{ width: 16, height: 28, borderRadius: 4, background: "#ffffff" }} />
          <div
            style={{ width: 16, height: 28, borderRadius: 4, background: "#ffffff", opacity: 0.6 }}
          />
        </div>
        {BRAND.name}
      </div>
      <div style={{ display: "flex", fontSize: 76, lineHeight: 1.1, letterSpacing: -2 }}>
        {hero.headline}
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#5c5966" }}>{hero.exportLine}</div>
    </div>,
    size,
  );
}
