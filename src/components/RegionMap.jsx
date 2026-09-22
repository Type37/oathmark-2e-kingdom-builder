import React from "react";
import { hueOf } from "../race.mjs";

// Radii scale to the outermost region so a small kingdom still fills the box.
function radii(count) {
  const step = 138 / count;
  return Array.from({ length: count }, (_, i) => Math.round(step * (i + 1)));
}

export default function RegionMap({ regions, playable, picks, activeRegion, litRegion, hoverKey, onSlotHover, onRegionHover, onSlotClick }) {
  // Animate only the slot that just arrived, not every filled slot on re-render.
  const [claimed, setClaimed] = React.useState(null);
  const prev = React.useRef(picks.length);
  React.useEffect(() => {
    if (picks.length > prev.current) {
      const last = picks[picks.length - 1];
      const slot = picks.filter((p) => p.region === last.region).length - 1;
      setClaimed(`${last.region}-${last.name}-${slot}`);
      const t = setTimeout(() => setClaimed(null), 700);
      prev.current = picks.length;
      return () => clearTimeout(t);
    }
    prev.current = picks.length;
  }, [picks]);

  const inPlay = new Set(playable ?? regions);
  const outer = Math.max(...regions);
  const R = radii(outer);
  const pickAt = (region, index) => picks.filter((p) => p.region === region)[index] ?? null;

  return (
    <svg viewBox="-150 -150 300 300" width="100%" role="img"
         style={{ maxWidth: 300, maxHeight: 300, display: "block", margin: "0 auto" }}
         aria-label={`Regions 1 to ${outer}`}>
      {[...regions].reverse().map((region) => {
        const r = R[region - 1];
        const inner = region === 1 ? 0 : R[region - 2];
        const step = 360 / region;
        return (
          <g key={region}>
            {Array.from({ length: region }, (_, i) => {
              const a0 = (i * step - 90) * (Math.PI / 180);
              const a1 = ((i + 1) * step - 90) * (Math.PI / 180);
              const pick = pickAt(region, i);
              const key = pick ? `${pick.region}-${pick.name}-${i}` : null;
              const live = inPlay.has(region);
              const isLit = region === litRegion;
              const isActive = region === activeRegion || isLit;
              const isHovered = key && key === hoverKey;
              const d =
                region === 1
                  ? `M -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`
                  : [
                      `M ${inner * Math.cos(a0)} ${inner * Math.sin(a0)}`,
                      `L ${r * Math.cos(a0)} ${r * Math.sin(a0)}`,
                      `A ${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`,
                      `L ${inner * Math.cos(a1)} ${inner * Math.sin(a1)}`,
                      `A ${inner} ${inner} 0 0 0 ${inner * Math.cos(a0)} ${inner * Math.sin(a0)}`,
                      "Z",
                    ].join(" ");
              const mid = (inner + r) / 2;
              const ma = ((i + 0.5) * step - 90) * (Math.PI / 180);
              return (
                <g key={i}>
                  <path
                    className={`om-slot${key && key === claimed ? " om-slot-claimed" : ""}`}
                    d={d}
                    fill={pick ? `var(--color-background-${hueOf(pick.list)})`
                      : isActive ? "var(--color-accent-muted)"
                      : live ? "var(--color-background-card)" : "var(--color-background-body)"}
                    stroke={isLit ? "var(--color-accent)"
                      : pick ? `var(--color-border-${hueOf(pick.list)})`
                      : isActive ? "var(--color-accent)" : "var(--color-border-emphasized)"}
                    strokeWidth={isHovered || isLit ? 3 : isActive || pick ? 2 : 1}
                    strokeDasharray={live ? undefined : "4 4"}
                    style={{ cursor: live ? "pointer" : "default", opacity: live ? 1 : 0.55 }}
                    onMouseEnter={() => { onSlotHover?.(key); onRegionHover?.(region); }}
                    onMouseLeave={() => { onSlotHover?.(null); onRegionHover?.(null); }}
                    onClick={() => live && onSlotClick?.(region, i, pick)}
                  >
                    <title>{pick ? `Region ${region}: ${pick.name}` : live ? `Region ${region}` : `Region ${region}: campaign play`}</title>
                  </path>
                  {region === 1 ? null : (
                    <text
                      x={mid * Math.cos(ma)}
                      y={mid * Math.sin(ma) + 4}
                      textAnchor="middle"
                      fill="var(--color-text-secondary)"
                      fontSize="var(--font-size-2xs)"
                      pointerEvents="none"
                      aria-hidden="true"
                    >
                      {region}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
      <text x="0" y="4" textAnchor="middle" fontSize="var(--font-size-2xs)"
            pointerEvents="none" aria-hidden="true" fill="var(--color-text-secondary)">1</text>
    </svg>
  );
}
