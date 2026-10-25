import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 96,
          background: "linear-gradient(135deg, #FF9800 0%, #EA580C 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "40px",
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        P
      </div>
    ),
    {
      ...size,
    }
  );
}
