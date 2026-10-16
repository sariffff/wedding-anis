import { ImageResponse } from "next/og";

export const alt = "Anis & Usman — 17.10.2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only text: the default OG font has no Thai glyphs.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF8F9 0%, #EEC3CD 100%)",
          color: "#5A2E44",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 12, color: "#C9A86A" }}>
          WEDDING
        </div>
        <div style={{ fontSize: 120, color: "#C8709C", marginTop: 16 }}>
          Anis &amp; Usman
        </div>
        <div
          style={{ width: 200, height: 2, background: "#C9A86A", marginTop: 24 }}
        />
        <div style={{ fontSize: 48, marginTop: 24 }}>17.10.2026</div>
      </div>
    ),
    size,
  );
}
