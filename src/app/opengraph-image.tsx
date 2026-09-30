import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background:
            "radial-gradient(circle at 15% 20%, rgba(140,82,255,0.45), transparent 55%), radial-gradient(circle at 90% 80%, rgba(255,102,196,0.35), transparent 50%), #141414",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="92" height="200" viewBox="0 0 46 100">
            <path d="M0 21 L35 1 L35 41 Z" fill="#8c52ff" />
            <path d="M0 50 L35 30 L35 70 Z" fill="#e2a9f1" />
            <path d="M0 79 L35 59 L35 99 Z" fill="#ff66c4" />
            <rect x="41.5" y="1" width="3" height="98" fill="#ffffff" />
          </svg>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 600, letterSpacing: -4 }}>
            <span
              style={{
                backgroundImage: "linear-gradient(100deg, #5b6cff, #8c52ff 45%, #ff66c4)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              AOM
            </span>
            <span>Tech</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 44, color: "#d8d3e6" }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
