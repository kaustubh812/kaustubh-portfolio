import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080d",
          borderRadius: 36,
          color: "#f0eff6",
          fontSize: 104,
          fontWeight: 700,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        K
        <div
          style={{
            position: "absolute",
            right: 34,
            bottom: 44,
            width: 26,
            height: 26,
            borderRadius: 26,
            background: "#8b7cff",
          }}
        />
      </div>
    ),
    size
  );
}
