import { ImageResponse } from "next/og";
import { LAYERS_GRADIENT, LAYERS_SVG_PATHS } from "@/components/icons/layers";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Icon component - layered context/memory icon
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: `linear-gradient(135deg, ${LAYERS_GRADIENT.from} 0%, ${LAYERS_GRADIENT.to} 100%)`,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "6px",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layered context icon - three stacked rounded rectangles */}
        {LAYERS_SVG_PATHS.map((layer, i) => (
          <rect
            key={i}
            x="2"
            y={layer.y}
            width="16"
            height="4"
            rx="2"
            fill="white"
            fillOpacity={layer.opacity}
          />
        ))}
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
