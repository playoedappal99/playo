import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function AppleIcon() {
  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), "public", "images", "playo-logo.png")
  );
  const base64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: "40px",
          padding: "20px",
        }}
      >
        <img
          src={base64}
          alt="Playo Logo"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
