"use client";

import { forwardRef } from "react";
import { LAYERS_GRADIENT, LAYERS_SVG_PATHS } from "./layers-constants";

// Re-export for backward compatibility
export { LAYERS_GRADIENT, LAYERS_SVG_PATHS };

export type LayersIconProps = {
  size?: number;
  className?: string;
};

export const LayersIcon = forwardRef<SVGSVGElement, LayersIconProps>(
  ({ size = 24, className }, ref) => {
    const scale = size / 24;
    const padding = 3 * scale;
    const rectWidth = 18 * scale;
    const rectHeight = 4 * scale;
    const rx = 2 * scale;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Layered context icon - three stacked rounded rectangles */}
        {LAYERS_SVG_PATHS.map((layer, i) => (
          <rect
            key={i}
            x={padding}
            y={layer.y * scale}
            width={rectWidth}
            height={rectHeight}
            rx={rx}
            fill="currentColor"
            fillOpacity={layer.opacity}
          />
        ))}
      </svg>
    );
  },
);

LayersIcon.displayName = "LayersIcon";
