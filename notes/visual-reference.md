# Visual reference — measured, not guessed

Both palettes sampled from rendered pages with Pillow; fonts read from the PDF
font resources with pypdf.

## Oathmark: Second Edition (Osprey Games, 2026)

Typefaces, from the embedded font table:

| Role | Face |
|---|---|
| Display caps | **P22 Morris Troy** — William Morris blackletter, used for "BUILDING A KINGDOM" |
| Body | **Berling LT Std** Roman / Italic / Bold — old-style serif |
| Labels, small caps | **Gandur New** Light / Semibold — humanist sans |
| Script accent | **P22 Civilite Pro No 8** — the *Lay of the Marches* verse fragments |

Palette, sampled from book p18 (the Building a Kingdom table):

| Token | Hex | Notes |
|---|---|---|
| Paper | `#f7eedd` | hue 38°, sat 10% — warm cream, the dominant field |
| Paper deep | `#ebdcc1` | page-edge and mottling |
| Card | `#ffffff` | pure white, used only for inset callouts |
| Ink | `#221f1f` | warm near-black body text |
| Bar | `#5c5953` | hue 40°, sat 10% — the warm grey table header band |
| Rule | `#d7b5a6` | hue 18°, sat 23% — dusty rose row dividers |

The whole book runs on one hue family, roughly 18–40°. There is **no saturated
accent colour at all** — emphasis comes from the grey bar, the rose rule, and
blackletter caps. Any bright accent would read as foreign.

## Runewars Miniatures Game, Tournament Regulations v1.0 (FFG)

| Role | Face |
|---|---|
| Display | **Almendra Bold** and **Almendra Bold SC** (small caps) |
| Body | **Times New Roman PS** Roman / Bold / Italic, plus a bold small-caps cut |
| Incidental | Eurostile LT Std Demi Oblique |

| Token | Hex | Notes |
|---|---|---|
| Paper | `#eef1dd` | cool sage cream — note the green cast, unlike Oathmark's warm cream |
| Ink | `#231f20` | near-neutral near-black |
| Heading | `#841216` | deep oxblood, subheads only, never body |

Conventions worth stealing: two-column body at roughly 55 characters; red
reserved strictly for subheads; **small caps for proper nouns** in running text
("Runewars Miniatures Game"); ornamental border framing a plain text block;
page number in a centred cartouche.

## What this means for the app

- Warm cream field, warm grey structure, dusty rose dividers. One hue family.
- Oxblood `#841216` is the one legitimate accent, borrowed from FFG, and only
  for headings or a single emphasis — never a fill.
- Web substitutes, both on Google Fonts: **Almendra SC** for display (matches
  FFG exactly, and reads close to Morris Troy's spirit), **EB Garamond** for
  body (old-style, closest free stand-in for Berling).
- Small caps for proper nouns is a cheap, period-correct move.
- No gradients, no glow, no rounded-everything. The source material is
  letterpress-flat.
