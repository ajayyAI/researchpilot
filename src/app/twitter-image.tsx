import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} social card`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        background:
          "linear-gradient(135deg, #121212 0%, #1b1b1b 55%, #242424 100%)",
        color: "#f5f5f5",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "54px",
              height: "54px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              background:
                "linear-gradient(145deg, rgba(217,119,6,0.95), rgba(249,115,22,0.88))",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "999px",
                background: "#ffffff",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {siteConfig.name}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: "820px",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              borderRadius: "999px",
              padding: "10px 16px",
              fontSize: 18,
              color: "#fbbf24",
              background: "rgba(217,119,6,0.1)",
              border: "1px solid rgba(217,119,6,0.28)",
            }}
          >
            AI deep research for complex questions
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
              fontWeight: 760,
            }}
          >
            Research the web recursively, track source coverage, and ship a
            polished report faster.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "rgba(245,245,245,0.72)",
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    </div>,
    size,
  );
}
