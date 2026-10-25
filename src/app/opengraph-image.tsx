import { ImageResponse } from "next/og";

export const alt = "PLAYO Edappal - Premier Kids' Toy Store & Ride-On Showroom in Malappuram, Kerala";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #070D18 0%, #0D1B2A 50%, #16283C 100%)",
          color: "#ffffff",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Glow rings */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 152, 0, 0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%)",
          }}
        />

        {/* Top Location Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            borderRadius: "9999px",
            background: "rgba(255, 152, 0, 0.15)",
            border: "1.5px solid rgba(255, 152, 0, 0.4)",
            color: "#FF9800",
            fontSize: "18px",
            fontWeight: "800",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}
        >
          📍 NEAR NESTO HYPERMARKET, EDAPPAL, MALAPPURAM
        </div>

        {/* Main Logo Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "82px",
              fontWeight: "900",
              letterSpacing: "-2px",
              color: "#ffffff",
              textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            PLAYO
          </span>
          <span
            style={{
              fontSize: "44px",
              fontWeight: "800",
              color: "#FF9800",
              background: "rgba(255, 152, 0, 0.18)",
              padding: "6px 20px",
              borderRadius: "16px",
              border: "2px solid #FF9800",
              marginLeft: "12px",
            }}
          >
            EDAPPAL
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: "600",
            color: "#cbd5e1",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: "1.4",
            marginBottom: "38px",
          }}
        >
          Premier Kids&apos; Electric Ride-On Cars, 4x4 Battery Jeeps, RC Drift Supercars &amp; Toys
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "16px",
              fontWeight: "700",
              color: "#f8fafc",
            }}
          >
            ⚡ Electric Ride-On Jeeps &amp; Cars
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "16px",
              fontWeight: "700",
              color: "#f8fafc",
            }}
          >
            🏎️ High-Speed RC Drift Cars
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "16px",
              fontWeight: "700",
              color: "#f8fafc",
            }}
          >
            🛵 Mini Bikes &amp; LED Scooters
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(22, 163, 74, 0.2)",
              border: "1px solid #16a34a",
              fontSize: "16px",
              fontWeight: "700",
              color: "#86efac",
            }}
          >
            🚚 Kerala-Wide Delivery
          </div>
        </div>

        {/* Bottom Bar: Website & Open Hours */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "960px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "20px",
            fontSize: "17px",
            color: "#94a3b8",
            fontWeight: "600",
          }}
        >
          <div>🌐 playoedappal.in</div>
          <div>🕒 Open All 7 Days: 9:30 AM – 10:30 PM</div>
          <div>📞 +91 96059 73308</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
