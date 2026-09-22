# Oathmark Kingdom Builder: handoff

A web app for *Oathmark: Second Edition* (Osprey Games) that builds a kingdom and musters an army from it, enforcing the book's rules. It's one of the WarLore builders.

**Why this exists:** a personal experiment with the **Astryx Design System** (`@astryxdesign/*`, https://astryx.atmeta.com). The point is to build a real tool inside Astryx's frame, tokens and components rather than hand-rolled CSS — so prefer Astryx components and `defineTheme` overrides over bespoke markup, and treat any drift back into raw CSS as a smell.

- **Live:** https://type37.github.io/oathmark-2e-kingdom-builder/
- **Repo:** https://github.com/Type37/oathmark-2e-kingdom-builder (public, branch `main`)
- **Deploy:** every push to `main` runs the tests, builds and deploys to Pages via `.github/workflows/pages.yml`, in about 30 seconds.

## Run it

```
npm install
npm run dev      # http://localhost:5178
npm test         # 84 tests, node:test
npm run build    # BASE_PATH=/repo-name/ is set by the workflow
```

## Accounts and tooling

- Commit as `Type37 <elwongo2@gmail.com>`; it's set in this repo's git config.
- `gh` has two accounts. **Type37** is active; the work account `thundertech-creative` is the other. This repo's git uses `gh auth git-credential`, so pushes go out as Type37.
- **Use Edge only, never Chrome.** Playwright MCP is set to `--browser msedge` in `~/.claude.json` (takes effect next session). Edge screenshot scripts live in `.playwright-mcp/` (git-ignored).
- If Playwright hangs on `newPage`, look for orphaned automation browsers (`ps … | grep remote-debugging-pipe`) and kill them. Keep the Mac awake with `caffeinate -i` during long runs; sleep killed several agents.

## Design rules (set by the owner)

The look follows the book (`notes/book-style.md`), made colourful through race colours. Everything goes through Astryx tokens and `components` overrides in `src/theme/marches.ts`; `paper.css` holds only what no token reaches.

1. **Square cards.** Buttons keep Astryx's default radius.
2. **Tables follow the book:** a warm-grey header bar (`--color-bar`) with pale text, dusty-rose row rules, no stripes.
3. **No dark text on dark backgrounds.**
4. **One primary action per screen, docked at the bottom** (`.om-cta-dock`): up to 512px, Grenze Gotisch, title case. Other buttons use Astryx `md` and Cabin.
5. **Mobile-ready.** Check at 390px and 1280px in Edge, with no sideways scrolling.
6. **Match the Hobgoblin army builder** for flow and interaction (see `notes/hobgoblin-flow.md`).
7. **Back goes up a level, never off the site.**
8. **Icons are never clipped.** Book marks carry their own `box` (viewBox) in `src/icons/marks.json`.
9. **The app writes no prose of its own.** Labels come from the book's vocabulary.

**Type** (Astryx sets families only; it owns the scale, weights and line heights):

| Role | Face | Token |
|---|---|---|
| All text | Berling LT Std (owner's web licence, self-hosted from `public/fonts/berling/`); Crimson Pro is the fallback | `--font-family-body` |
| Headings, table bars, plates, docked CTA | Grenze Gotisch | `--font-family-heading` |
| Buttons, tabs, tokens, badges | Cabin | `--font-family-ui` (local) |

**Colour:** page `#FBF7EF` over the parchment scan, cards `#FFFFFF`, ink `#221F1F`, warm grey `#5C5953` (secondary text and bars), dusty rose `#D7B5A6` (borders), magenta accent `#D40B61` (`#EC0C6C` as `--color-highlight` for fills only).

**Race colours** use Astryx's categorical families (`src/race.mjs`), retuned in the theme as manuscript pigments: dwarf `orange` (copper), elf `green` (verdigris), goblin `yellow` (orpiment), human `blue` (lapis), orc `red` (vermilion), necropolis `purple`, unaligned `gray`. Use them through `Card variant`, `Token color`, or `var(--color-{background,border,text}-<hue>)`.

**Book shapes:** `.om-plate` is the notched, double-ruled label plate; `.om-callout` is the pale-magenta notched callout. Both use CSS `corner-shape: scoop` (Chromium), with plain radius elsewhere.

## App structure

- **Landing** (`#/`): three cards, **Kingdom Builder**, **Army Builder** and **Unit Collection**, with no rail.
- **Inside a builder** the Astryx SideNav rail lists the three builders, the saved Kingdoms and Armies, and Rules › Reference.
- **Lists** (`#/kingdoms`, `#/musters`) have a docked CTA (New Kingdom / Muster a New Army) that opens a modal, plus a ⋯ menu with Import and Export All.
- **Records** (`#/kingdom`, `#/muster`) autosave every edit into the store, so there is no Save button. Their ⋯ menu has Export, Duplicate and Delete (Delete asks through an AlertDialog).
- **Unit Collection** is one global record (`store.collections[0].owned`), shared by every muster's shortfall check.
- **Kingdom page:** Region 1 lists the six capitals with everything each grants; the territory picker shows race · grants. The Kingdom Sheet panel is the book's p217 sheet (name, ruler, emblem, rings) followed by `FigureAccess`, every figure the kingdom can muster, grouped by race; new rows rise in. No Chronicle.
- **Name rolls:** `NameField` (TextInput + dice) draws from `src/names.mjs`: army and hero pools from the Dragon Rampant 2e builder, plus a realm pool. The big sci-fi pools (Infinity etc.) live in the Xenos Rampant builder's `src/factions.js`.
- **Experience** shows game-icons rank-1/2/3 chevrons (`Level.jsx`).
- **New kingdom modal:** name, ruler, experience and emblem. **New army modal:** the p218 roster header (Army Name, Army Commander, Total Points) plus the Kingdom, with a Roll button for the p33 Random Points table.

## Astryx gotchas (learned the hard way)

- **Dialog titles go in a Layout header slot:** `<Dialog><Layout header={<DialogHeader title onOpenChange/>} content footer/></Dialog>`. `Dialog` has no `header` prop; passing one is silently ignored.
- **AppShell `mobileNav` config-object drawer does not render its content in 0.6.2.** The app uses `mobileNav={false}` plus a standalone controlled `<MobileNav isOpen onOpenChange>` opened by an `.om-menu-btn` hamburger. `paper.css` hides the SideNav below 768px and the hamburger above it.
- **AppShell breakpoints come from the theme:** `adaptations.widthBreakpoints` is declared in `marches.ts`.
- **Page width:** `Shell` caps pages with `Layout contentWidth` (`FRAME.contentWidth` = 1200), which covers the content column and the sheet panel together.
- **ListItem `description` as a plain string truncates to one line.** Pass a `<Text>` so it wraps.
- **Tables bleed by the Layout padding.** Keep `Layout padding` and `LayoutContent padding` equal (both 6), and don't wrap a Table in `Section padding={0}`. Column `pixel()` widths exclude cell padding.

## Images and print

- **Emblems:** `EmblemDialog` picks an image and crops it square with `cropperjs` on an `AspectRatio` 4:3 stage. The result is a 512px PNG, stored in IndexedDB with `idb-keyval` (`src/emblem.mjs`); the kingdom record keeps only the key. The emblem shows as a square Astryx `Avatar`: in the page header, on list cards, and in the Kingdom Sheet (Change / Remove). Duplicates share a key, so a blob is deleted only when no other kingdom uses it. Known gap: Export writes the key but not the image, so emblems don't travel to another device yet.
- **Print (planned, Army Roster):** reuse the Dropfleet builder's CSS-only approach, not a library: a `#print-container`, `body:has(> #print-container) > *:not(#print-container) { display: none }`, `@page { margin: 12mm }`, the WebKit block-flow reset, and `print-color-adjust: exact`. See `Dropfleet-Builder/css/app.css` around line 5214.

## Notes

| File | Contents |
|---|---|
| `notes/book-style.md` | The book's fonts, sizes, colours and layout, measured from the PDF. The accent is magenta `#ec0c6c`, and the older `visual-reference.md` is wrong about the book having no accent. |
| `notes/hobgoblin-flow.md` | Hobgoblin's routes, flow, interaction table (modal vs popover vs bottom sheet), measured sizes and colours, and the patterns to copy. Screenshots are in `notes/hobgoblin/` (git-ignored). |
| `notes/visual-reference.md`, `notes/typography.md` | Earlier palette notes, dash and middot rules. |

## Architecture

```
src/rules/        pure logic, fully tested (kingdom, muster, stats, collection, upgrades, magic, store, schema, examples)
src/data/oathmark.json   everything parsed from the PDF, plus `errata`
src/icons/        marks.json (book glyphs with per-glyph viewBox), game.mjs (laurel crown, muster; game-icons.net CC BY 3.0, credited in README)
src/useSection.mjs   hash routes (#/kingdoms, #/kingdom, …) with a PARENT map, so Back goes up a level
src/Shell.jsx     page frame: header (menu, back, title, ⋯), content, sheet panel
src/App.jsx       AppShell + SideNav/MobileNav, store, autosave, modals
src/panes/        one per section
src/theme/        marches.ts is the source; run `npx astryx theme build src/theme/marches.ts`. fonts.css loads Berling; paper.css holds the app's own rules.
src/race.mjs      capital list → Astryx categorical colour
```

Seven PDF errata are recorded in `oathmark.json` under `errata`, with reasoning.

## Done this session

- Pushed to GitHub with Pages deploy, and added the shared WarLore footer (`data-current="oathmark"`). Oathmark was also added to the `Type37/warlore-footer` tool list.
- Fixed a build error (a stray comma in KingdomPane), and a crash in Create Kingdom: Astryx's `Selector` needs its `options` passed as data, not as child elements.
- Browser Back now goes up a level. Landing cards read Found a Kingdom (laurel crown), Muster an Army (banner icon) and Unit Collections. The kingdom list shows 3 across, with Found a Kingdom docked at the bottom.
- Applied the design rules above: square cards, no dividers, phone margins (a bleeding `Section` was removed from KingdomPane), and a compact header on phones.

## Next, in order

1. **Clickable equipment, attributes and stats** (about 2 hours). Hand Weapon, Shield, Heavy Armour and the rest (15 equipment names in `figures[].equipment`), every attribute, and every stat open their explanation: a popover on desktop, a bottom sheet on phones, the same as Hobgoblin's keywords. The book has no equipment glossary: equipment is already built into the stats (p43), and only missile weapons have ranges (p72 table).
2. **Selectable points options per unit** (about 1 hour). Show unit options and upgrades as radio or checkbox rows with the cost on the right, like Hobgoblin's TYPE list.
3. **Routes per record**, e.g. `#/kingdom/:id` and `#/muster/:id/u/:unitId`, so each screen can be deep-linked.
4. **A muster list with a docked "Muster an Army" CTA.** The Muster screen is empty until a kingdom is loaded.
5. **Unit Collections** currently opens the Reference pane (attributes, spells, items). Decide whether it should open Collection instead.
6. Carried over from before: characters joining units, choosing spells and magic items, the p218 roster print view, regions 5–6 and campaign play.

## Known issues

- The main JS chunk is 3.3 MB (590 KB gzipped), because `Ico.jsx` loads the whole pepicons set. Import only the icons used.
- There's no error boundary, so one crash blanks the whole app.
- The Actions workflow gets a Node 20 deprecation warning; bump `checkout`/`setup-node`/`upload-pages-artifact`/`deploy-pages` to their latest majors.
- `src/screens/KingdomBuilder.jsx`, `Muster.jsx`, `Collection.jsx` and `Saves.jsx` are dead code and safe to delete. `Chronicle.jsx` is still used.
- Auth and cloud save are still undecided: Supabase, a serverless function, or none. JSON export/import already works.

## Source

`Oathmark-2e-small.pdf` is the owner's purchased ebook. It's watermarked to the buyer, git-ignored, and must never be committed. All data was extracted from it, with page numbers.
