import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} social card`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, rgba(217,119,6,0.28), transparent 42%), linear-gradient(135deg, #111111 0%, #171717 50%, #242424 100%)",
        color: "#f5f5f5",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.08), transparent 40%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flex: 1,
          padding: "60px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "70%",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "64px",
                height: "64px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "18px",
                background:
                  "linear-gradient(145deg, rgba(217,119,6,0.95), rgba(249,115,22,0.9))",
                boxShadow: "0 18px 50px rgba(217,119,6,0.26)",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "999px",
                  background: "#ffffff",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                }}
              >
                {siteConfig.name}
              </span>
              <span
                style={{
                  fontSize: 20,
                  color: "rgba(245,245,245,0.72)",
                }}
              >
                Source-backed AI deep research
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                borderRadius: "999px",
                border: "1px solid rgba(217,119,6,0.35)",
                padding: "10px 16px",
                fontSize: 20,
                color: "#fbbf24",
                background: "rgba(217,119,6,0.1)",
              }}
            >
              Recursive search. Verified sources. Clean reports.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 62,
                lineHeight: 1.02,
                fontWeight: 750,
                letterSpacing: "-0.04em",
              }}
            >
              Go from question to decision-ready research in one workspace.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "280px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "260px",
              height: "260px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.14)",
              background:
                "radial-gradient(circle, rgba(217,119,6,0.24) 0%, rgba(217,119,6,0.02) 62%, transparent 72%)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "184px",
                height: "184px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "999px",
                border: "2px solid rgba(251,191,36,0.45)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "108px",
                  height: "108px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  border: "2px solid rgba(245,245,245,0.4)",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "999px",
                    background: "#fbbf24",
                    boxShadow: "0 0 0 16px rgba(251,191,36,0.18)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
