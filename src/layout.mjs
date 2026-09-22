// Responsive contract, written down per the Astryx layout docs. Each line
// names the mechanism that enforces it, so the comment cannot drift.
//
//   >1024   content table | sheet panel 360        (Layout end slot)
//   <=1024  panel becomes a Dialog                 (useMediaQuery)
//   <=768   nav collapses to MobileNav             (AppShell mobileNav "md")
//   <=768   stat table drops to name + Pts + Add   (COLUMNS_NARROW)
//
// Anti-shift rules, because the old layout jumped on every interaction:
//   - Stat columns are fixed px, identical on every tab.
//   - The panel region reserves its width whether or not it has content.
//   - The stepper never auto-advances; the user moves it.

export const FRAME = { padding: 4, contentWidth: 1200 };
export const PANEL = { library: 240, detail: 360, kingdom: 340, roster: 360 };
export const GAP = { tight: 1, item: 2, group: 4, section: 6 };
export const DENSITY = { choice: "spacious", data: "balanced", dense: "compact" };
export const CONTROL = "sm";

export const BREAK = {
  panel: "(max-width: 1024px)",
  narrow: "(max-width: 768px)",
};

// Column widths never vary by tab, so switching tabs cannot reflow the table.
export const COL = { stat: 52, name: 168, special: 220, base: 64, action: 76 };
// "3d10" and "10+" need more room than a bare digit.
export const statWidth = (key) => (key === "CD" ? 88 : key === "D" || key === "A" || key === "M" || key === "pts" ? 58 : COL.stat);
