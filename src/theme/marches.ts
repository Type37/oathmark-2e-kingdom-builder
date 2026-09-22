import { defineTheme } from "@astryxdesign/core/theme/tokens";

// Palette and type sampled from Oathmark: Second Edition p18 and the FFG
// Runewars regulations; see notes/visual-reference.md for the measurements.
export default defineTheme({
  name: "marches",

  // Oxblood is the one accent in the source material, and only for emphasis.
  color: { accent: "#5D2A42", neutralStyle: "warm", contrast: "high" },

  typography: {
    scale: { base: 17, ratio: 1.2 },
    // Sans for UI chrome, so controls read as controls; the serif is reserved
    // for the book's own words (definitions, chronicle).
    body: {
      family: "Cabin",
      fallbacks: "'Gill Sans', 'Gill Sans MT', 'Helvetica Neue', Helvetica, sans-serif",
    },
    heading: {
      family: "Almendra SC",
      fallbacks: "'EB Garamond', Palatino, Georgia, serif",
      weight: "bold",
      weights: { 1: "bold", 2: "bold", 3: "bold" },
    },
  },

  // Each entry is [light, dark].
  localTokens: {
    "--font-family-prose": "'EB Garamond', 'Iowan Old Style', Palatino, Georgia, serif",
  },

  tokens: {
    "--color-accent": ["#5D2A42", "#FCB1A6"],
    "--color-on-accent": ["#FFF9EC", "#2A1220"],
    "--color-accent-muted": ["#FCB1A6", "#5D2A42"],
    "--color-background-body": ["#FFF9EC", "#2A1220"],
    "--color-background-surface": ["#FFFDF7", "#361926"],
    "--color-background-card": ["#FFFFFF", "#40202F"],
    "--color-background-muted": ["#FFDCCC", "#4A2637"],
    "--color-text-primary": ["#5D2A42", "#F6E4D8"],
    "--color-text-secondary": ["#7A4258", "#E8C9BC"],
    "--color-border": ["#FCB1A6", "#5D2A42"],
    "--color-border-emphasized": ["#5D2A42", "#8E5066"],
    // Bubblegum Pink: decorative fills and progress only, never behind text.
    "--color-highlight": ["#FB6376", "#FB6376"],
  },
});
