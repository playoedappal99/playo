import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 34,
          background: "linear-gradient(135deg, #FF9800 0%, #EA580C 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "16px",
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 4px 12px rgba(234, 88, 12, 0.4)",
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
