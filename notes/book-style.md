# Oathmark 2e: measured type and colour

Source: `Oathmark-2e-small.pdf`, pp2–225. Measured with PyMuPDF: every text span (font, size, fill colour) and every vector fill and stroke. Percentages are shares of all text characters. The ebook's Helvetica watermark is left out.

## Page

- Trim: 540.7 × 693.9 pt (191 × 245 mm).
- One text column, 346 pt wide. Left edge at x=92 on one side of the spread and x=106 on the other; right edge at 438 / 452.
- Body leading is 12.5 pt on 9.5 pt type (1.32).
- Stat tables run on an 8.4 pt line pitch; rows are two lines, 16.8 pt.

## Faces

| Face | Where it's used |
|---|---|
| **Berling LT Std**: Roman, Italic, Bold, Bold Italic | All running text, tables, stat blocks. Old-style serif. |
| **Gandur New**: Light, Semibold, Bold | Chapter titles, section heads, table header labels, sheet labels. Humanist sans, always set in caps except section heads. |
| **P22 Morris Troy** | Page numbers and the *Lay of the Marches* verse. |
| **P22 Civilité Pro No 8** | A few decorative initials (p29, p224). |

## Type roles

| Role | Face | Size pt | Case | Colour | Example |
|---|---|---|---|---|---|
| Chapter title | Gandur New Light | 48 | CAPS | `#221f1f` | p7 "INTRODUCTION" |
| Sheet title | Gandur New Light | 36 | CAPS | `#221f1f` | p218 "KINGDOM SHEET" |
| Chapter opener head | Gandur New Light | 22 | CAPS | `#221f1f` | p13, p185 |
| Appendix head | Gandur New Light | 20 | CAPS | `#221f1f` | p184 |
| Terrain / sub-topic head | Gandur New Light | 18 | Title | `#6d6963` | p57 "Rough Ground" |
| Section head | Gandur New Semibold | 26 | Title | `#ec0c6c` | p12 "What is Wargaming?" |
| Sidebar head | Gandur New Semibold | 16 | CAPS | `#ec0c6c` | p33 "A NOTE ABOUT BORDERS" |
| Contents entry | Gandur New Semibold | 12 | Title | `#ec0c6c` | p4 |
| Table title | Gandur New Semibold | 10 | CAPS | `#221f1f` | p18 "BUILDING A KINGDOM" |
| Table header cell | Gandur New Semibold | 8 | CAPS | `#e4e3e2` on `#5c5953` bar | p18, p122 |
| Stat block header | Gandur New Bold / Light | 8 | CAPS | `#e4e3e2` | p95, p219 |
| Body | Berling Roman | 9.5 / 12.5 | Sentence | `#221f1f` | 73% of all text |
| Book title in text | Berling Italic | 9.5 | — | `#221f1f` | *Oathmark* |
| Run-in head | Berling Bold | 9–9.5 | Title | `#221f1f` | p4, p23 "Ancient Ruins (3)" |
| Stat block / figure entries | Berling Roman | 7 | — | `#221f1f` | p88–180, 10% of all text |
| Table cells | Berling Roman | 8 | — | `#221f1f` | p18 |
| Kingdom lists | Berling Roman | 9 | — | `#221f1f` | p21 |
| Footnotes and callout text | Berling Roman | 10 | — | `#ec0c6c` | p21, p42 |
| Cross-reference / link | Berling Roman or Italic | 9–9.5 | — | `#408080` | p4, p13 |
| Page number | Morris Troy | 11 | — | `#5c5953` | every page |
| Verse | Morris Troy | 9 | — | `#221f1f` | p9, p17 |

## Colour

| Hex | Role | Measured as |
|---|---|---|
| `#221f1f` | Ink: body, titles, table cells | text, 90%+ of characters |
| `#5c5953` | Warm grey: table header bars (18 pt tall), page numbers, rules | fill (largest non-white area) and stroke |
| `#e4e3e2` | Light text on the grey bars | text |
| `#ec0c6c` | **Accent magenta**: section and sidebar heads, footnotes, callout text, diagram rules | text, fill, stroke 0.75–2 pt |
| `#e9186c` | Same magenta in diagrams (units, arrows) | fill, p49–65 |
| `#fce6e8` | Pale pink callout / sidebar box fill | fill, p21–35 |
| `#f9bfc7` | Pink callout border | stroke 1 pt |
| `#d7b5a6` | Dusty rose table row rules | stroke 1 pt, 5,700 uses (the most common line in the book) |
| `#6d6963` | Mid grey sub-heads | text |
| `#408080` | Teal cross-references and URLs | text |
| `#ffffff` | Inset panels and cards | fill |
| `#f7eedd` | Paper (raster parchment background) | sampled from rendered pages, see `visual-reference.md` |

The accent is a saturated magenta. `visual-reference.md` says the book has "no saturated accent colour at all", which is wrong: that note sampled only p18.

## Tables

- A dark bar in `#5c5953`, 18 pt tall, with Gandur caps in `#e4e3e2`.
- Rows are separated by 1 pt dusty-rose rules (`#d7b5a6`).
- No zebra stripes, no vertical rules, no rounded corners.

## Web stand-ins

| Book face | Current app | Nearest free option |
|---|---|---|
| Berling LT Std | EB Garamond | Both are old-style serifs. Crimson Pro is closer in x-height and colour at small sizes; worth a side-by-side. |
| Gandur New | Cabin | Both humanist sans. Alegreya Sans has a closer Light weight for 48/22 pt caps titles. |
| P22 Morris Troy | Almendra SC | No free Troy revival. Almendra SC is the nearest in spirit. |
| P22 Civilité | — | Not used in the app. |

## What this means for the app

- Our Blackberry/Powder Blush palette sits close to the book's magenta + pale pink family. The book's grey structure (`#5c5953` bars, `#e4e3e2` labels) is the part we don't use.
- The book's heads are a light sans in caps. Our Almendra SC heads come from the FFG reference, not from this book.
