import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#08080d",
          color: "#f0eff6",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            color: "#8b7cff",
          }}
        >
          {profile.role.toUpperCase()} · {profile.company.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#b4b1c5",
              maxWidth: 900,
            }}
          >
            I build AI that ships — and stays shipped.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#7c7990",
          }}
        >
          <div style={{ display: "flex" }}>
            RAG · Agentic AI · Voice · Production
          </div>
          <div style={{ display: "flex", color: "#8b7cff" }}>
            Ask my portfolio anything →
          </div>
        </div>
      </div>
    ),
    size
  );
}
