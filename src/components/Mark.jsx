import React from "react";
import marks from "../icons/marks.json";

// Drawn glyphs, 1000-unit em, y-up: flipped into SVG's y-down box.
export default function Mark({ name, size = 20, label }) {
  const d = marks[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 1000 1000"
      width={size}
      height={size}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g transform="translate(0,1000) scale(1,-1)">
        <path d={d} fill="currentColor" />
      </g>
    </svg>
  );
}

export const MARK_NAMES = Object.keys(marks);
