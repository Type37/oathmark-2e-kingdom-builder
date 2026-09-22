# Oathmark Kingdom Builder — handoff

A web app for *Oathmark: Second Edition* (Osprey Games, 2026). Build a kingdom,
muster an army against it, with the book's rules enforced.

Nothing has been committed or pushed. There is no `.git` here and no remote, so
the project is clean to initialise under whichever account you want.

## Run it

```
npm install
npm run dev      # http://localhost:5178
npm test         # 83 tests, node:test
npx astryx doctor
```

## State: what works

- **Rules engine, 83 passing tests.** Kingdom legality, muster caps, derived
  combat numbers, collection shortfalls, upgrades, spell lists, named saves,
  import validation.
- **Data extracted from the PDF**: 123 figures / 147 stat variants, 59
  territories, 39 attributes, 53 spells, 13 magic items, 73 upgrades — all
  verbatim, with page numbers.
- **Verified against the book's own worked examples.** Grundeland and Vasala
  (pp24–25) both validate. The combat example (p69), shooting example (p76) and
  flank-dice note (p65) reproduce exactly. The knucker 20% case (p35) returns
  the book's arithmetic.
- **UI**: landing cards, kingdom list with the two pregens seeded, kingdom
  builder with all regions visible, muster with a stat table and upgrade
  picker, collection, reference, saves with export/import.

## Architecture

```
src/rules/     pure logic, no React, fully tested
  kingdom.mjs    territory legality, figure pool, attribute lookup
  muster.mjs     army validation: caps, 20% rule, magic items, characters
  stats.mjs      derived numbers: combat dice, target number, morale, ranks
  collection.mjs owned miniatures vs what a list needs
  upgrades.mjs   mount/chariot options, level-scaled costs, prerequisites
  magic.mjs      spell lists per race, spells known
  store.mjs      named saves, export/import, merge
  schema.mjs     zod validation for untrusted imported files
  examples.mjs   the book's two worked kingdoms
src/data/oathmark.json   everything parsed from the PDF, plus `errata`
src/icons/marks.json     27 icon vectors
src/panes/     one per section, each renders the shared Shell
src/Shell.jsx  the single three-region frame (library | content | detail)
src/theme/     marches.ts is the source; marches.css/js are BUILT — do not edit
```

`npx astryx theme build src/theme/marches.ts` after any theme change.

`src/screens/` is the previous UI generation. `Chronicle.jsx` is still used;
`KingdomBuilder.jsx`, `Muster.jsx`, `Collection.jsx` and `Saves.jsx` are dead
and safe to delete.

## Seven errata found in the source PDF

All recorded in `oathmark.json` under `errata`, with reasoning.

1. **Goblin Champion** lists Smithies as its terrain, an Orc territory. The
   kingdom list (p21) grants it from Slave Camps.
2. **Goblin Spellcaster** lists Dungeons for levels 1–5, also Orc. p21 says
   Warrens.
3. **Goblin City** list reads "1 Goblin Price". There is no Goblin Prince; the
   figure is the **Goblin Advisor**, whose own entry says goblins do not use
   the term.
4. **Orc King or Queen** extracted as `CD 35`. Combat Dice cap at 5 and every
   other King is CD3 H3; the orc pages carry a stray-glyph artifact.
5. **50×50 rank width** was 1, but the Unit Sizes table (p44) says one rank of
   up to three. With the wrong value, 2 trolls scored a morale bonus they are
   not entitled to.
6. **"Human Spells"** extracted as "Human S pells", so all 8 human spells fell
   into the Goblin and Orc list. p191 restricts a caster to General plus its
   own race, so this would have offered illegal spells.
7. **Option text** captured only its first line. The Elf King's chariot ended
   at "Wild Charge," losing Large, Limited Manoeuvres, Limited Movement and the
   50×100 base. 43 figures affected.

## Design decisions, and why

- **Palette**: Floral White `#FFF9EC`, Blackberry `#5D2A42`, Powder Blush
  `#FCB1A6`, Almond Silk `#FFDCCC`, Bubblegum `#FB6376`. Bubblegum measures
  2.8:1 on Floral White so it **never carries text** — it is a fill only, in
  `--color-highlight`. Blackberry carries the accent at 10.67:1.
- **Type**: Cabin for UI (Johnston and Gill Sans lineage), Almendra SC for
  display, EB Garamond for the book's own words via `.om-prose`. Astryx owns
  weights and line heights; do not hand-set them.
- **Copy rule**: the app writes no prose. Labels come from the book's own
  vocabulary; icons carry the rest.
- **Icons**: 27 vectors extracted from the `RWMIconsandNumbers` font embedded
  in the owner's PDF, converted to SVG paths. Stat mapping is in
  `FigureTable.jsx` / `StatLine.jsx`.
- **Layout contract** is written down in `src/layout.mjs`, each line naming the
  mechanism that enforces it.

## Not done

- **Regions 5 and 6** and campaign kingdom modification. Rarity (5)/(6)
  territories are earned by winning battles (p28–38); the data supports them
  and `canPlace` rejects them at creation, but there is no campaign screen.
- **Characters joining units** in the muster. `validateArmy` already checks
  base size, Move and Activation; the UI cannot attach one.
- **Spell and magic item selection** per caster. Rules and tests exist
  (`magic.mjs`), no UI.
- **Army Roster print/export** matching the p218 sheet.
- **A build step.** There is only a dev server. GitHub Pages needs
  `vite build`, plus `base` in `vite.config.js` if not served at the domain root.

## Open decision: auth and cloud save

GitHub Pages is static, so a Discord client secret cannot ship in the app.

1. **Supabase** — Discord is a built-in provider, Postgres for saves, driven
   from the browser with a publishable key. Best fit for static hosting.
2. **One serverless function** (Cloudflare/Netlify/Vercel) for the token
   exchange only, Pages still serving the app.
3. **No auth** — the export/import JSON path already works and is tested.

Whether Discord supports PKCE for public clients is worth checking; I did not
verify it.

## Source

`Oathmark-2e-small.pdf` sits in this folder and is the owner's purchased copy.
It is the source for all extracted data and is not redistributable. Notes on
the book's measured palette and typography are in `notes/visual-reference.md`;
dash and middot rules in `notes/typography.md`.
