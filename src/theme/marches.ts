import { defineTheme } from "@astryxdesign/core/theme/tokens";

// Colours and faces measured from Oathmark: Second Edition; see notes/book-style.md.
// Light only: the app renders <Theme mode="light">.
export default defineTheme({
  name: "marches",

  color: { accent: "#D40B61", neutralStyle: "warm", contrast: "high" },

  typography: {
    scale: { base: 17, ratio: 1.2 },
    body: {
      family: "Berling LT Std",
      fallbacks: "'Crimson Pro', 'Iowan Old Style', Palatino, Georgia, serif",
    },
    heading: {
      family: "Grenze Gotisch",
      fallbacks: "'Pirata One', Georgia, serif",
      weight: "normal",
      weights: { 1: "normal", 2: "normal", 3: "normal", 4: "normal", 5: "normal", 6: "normal" },
    },
  },

  localTokens: {
    // Controls: buttons, tabs, inputs, tokens.
    "--font-family-ui": "Cabin, 'Gill Sans', 'Segoe UI', sans-serif",
    // The book's header bar: warm grey with pale caps.
    "--color-bar": "#5C5953",
    "--color-on-bar": "#EDE8E0",
    // Full-strength magenta for fills that carry no text.
    "--color-highlight": "#EC0C6C",
  },

  tokens: {
    "--color-accent": "#D40B61",
    "--color-on-accent": "#FFFFFF",
    "--color-accent-muted": "#FCE6E8",
    "--color-text-accent": "#B8084F",
    "--color-icon-accent": "#D40B61",
    "--focus-outline-color": "#D40B61",

    "--color-background-body": "#FBF7EF",
    "--color-background-surface": "#FEFCF8",
    "--color-background-card": "#FFFFFF",
    "--color-background-popover": "#FFFFFF",
    "--color-background-muted": "#F1E9DA",
    "--color-background-inverted": "#5C5953",

    "--color-text-primary": "#221F1F",
    "--color-text-secondary": "#5C5953",
    "--color-icon-primary": "#221F1F",
    "--color-icon-secondary": "#5C5953",

    "--color-border": "#D7B5A6",
    "--color-border-emphasized": "#5C5953",
    "--color-overlay-hover": "#5C59530F",
    "--color-overlay-pressed": "#5C59531F",

    // Race colours ride the categorical families, toned as manuscript pigments.
    // human: lapis
    "--color-background-blue": "#C5D6E8",
    "--color-border-blue": "#2F5D8A",
    "--color-icon-blue": "#2F5D8A",
    "--color-text-blue": "#1B3652",
    // elf: verdigris
    "--color-background-green": "#C8DEC0",
    "--color-border-green": "#3D7747",
    "--color-icon-green": "#3D7747",
    "--color-text-green": "#1F4226",
    // dwarf: copper
    "--color-background-orange": "#EDCCA3",
    "--color-border-orange": "#B0601C",
    "--color-icon-orange": "#B0601C",
    "--color-text-orange": "#63300C",
    // goblin: orpiment
    "--color-background-yellow": "#E9DA9A",
    "--color-border-yellow": "#957811",
    "--color-icon-yellow": "#957811",
    "--color-text-yellow": "#554304",
    // orc: vermilion
    "--color-background-red": "#EBBDB2",
    "--color-border-red": "#A5302A",
    "--color-icon-red": "#A5302A",
    "--color-text-red": "#651912",
    // necropolis: murrey
    "--color-background-purple": "#D5C6E6",
    "--color-border-purple": "#674889",
    "--color-icon-purple": "#674889",
    "--color-text-purple": "#3C2854",
    // unaligned: stone
    "--color-background-gray": "#DAD2C6",
    "--color-border-gray": "#6D6963",
    "--color-icon-gray": "#6D6963",
    "--color-text-gray": "#35322F",
    // cross-reference teal, from the book's links
    "--color-background-teal": "#C0DAD7",
    "--color-border-teal": "#408080",
    "--color-icon-teal": "#408080",
    "--color-text-teal": "#1E4747",
    "--color-background-pink": "#F9CBD6",
    "--color-border-pink": "#D40B61",
    "--color-icon-pink": "#D40B61",
    "--color-text-pink": "#78063A",
  },

  // AppShell's mobileNav breakpoint ('md') resolves through these.
  adaptations: {
    widthBreakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 },
  },

  components: {
    card: {
      base: { borderRadius: "var(--radius-none)" },
      "variant:blue": { borderTop: "var(--spacing-1) solid var(--color-border-blue)" },
      "variant:green": { borderTop: "var(--spacing-1) solid var(--color-border-green)" },
      "variant:orange": { borderTop: "var(--spacing-1) solid var(--color-border-orange)" },
      "variant:yellow": { borderTop: "var(--spacing-1) solid var(--color-border-yellow)" },
      "variant:red": { borderTop: "var(--spacing-1) solid var(--color-border-red)" },
      "variant:purple": { borderTop: "var(--spacing-1) solid var(--color-border-purple)" },
      "variant:gray": { borderTop: "var(--spacing-1) solid var(--color-border-gray)" },
      "variant:teal": { borderTop: "var(--spacing-1) solid var(--color-border-teal)" },
      "variant:pink": { borderTop: "var(--spacing-1) solid var(--color-border-pink)" },
    },
    button: { base: { fontFamily: "var(--font-family-ui)" } },
    "side-nav-item": { base: { fontFamily: "var(--font-family-ui)" } },
    "dropdown-menu-item": { base: { fontFamily: "var(--font-family-ui)" } },
    "side-nav-section": { base: { fontFamily: "var(--font-family-ui)" } },
    "side-nav-heading": { base: { fontFamily: "var(--font-family-heading)" } },
    "dialog-header-title-block": { base: { fontFamily: "var(--font-family-heading)" } },
    // Grenze Gotisch only at headline size. Small labels follow the book's plain
    // sans capitals (Gandur New) in Cabin: field labels, table bars, plates.
    "field-label": { base: { fontFamily: "var(--font-family-ui)" } },
    tab: { base: { fontFamily: "var(--font-family-ui)" } },
    token: { base: { fontFamily: "var(--font-family-ui)" } },
    badge: { base: { fontFamily: "var(--font-family-ui)" } },
    "table-header-cell": {
      base: {
        backgroundColor: "var(--color-bar)",
        color: "var(--color-on-bar)",
        fontFamily: "var(--font-family-ui)",
        fontWeight: "var(--font-weight-semibold)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      },
    },
  },
});
