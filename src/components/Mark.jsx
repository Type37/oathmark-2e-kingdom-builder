import React from "react";
import marks from "../icons/marks.json";

// Glyphs are y-up font outlines; `box` is each one's own bounds after the flip.
export default function Mark({ name, size = 20, label }) {
  const m = marks[name];
  if (!m) return null;
  return (
    <svg
      viewBox={m.box.join(" ")}
      width={size}
      height={size}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={m.d} transform="scale(1,-1)" fill="currentColor" />
    </svg>
  );
}

export const MARK_NAMES = Object.keys(marks);
