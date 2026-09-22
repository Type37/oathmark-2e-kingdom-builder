# Oathmark Kingdom Builder: handoff

A web app for *Oathmark: Second Edition* (Osprey Games) that builds a kingdom and musters an army from it, enforcing the book's rules. It's one of the WarLore builders.

- **Live:** https://type37.github.io/oathmark-2e-kingdom-builder/
- **Repo:** https://github.com/Type37/oathmark-2e-kingdom-builder (public, branch `main`)
- **Deploy:** every push to `main` runs the tests, builds and deploys to Pages via `.github/workflows/pages.yml`, in about 30 seconds.

## Run it

```
npm install
npm run dev      # http://localhost:5178
npm test         # 83 tests, node:test
npm run build    # BASE_PATH=/repo-name/ is set by the workflow
```

## Accounts and tooling

- Commit as `Type37 <elwongo2@gmail.com>`; it's set in this repo's git config.
- `gh` has two accounts. **Type37** is active; the work account `thundertech-creative` is the other. This repo's git uses `gh auth git-credential`, so pushes go out as Type37.
- **Use Edge only, never Chrome.** Playwright MCP is set to `--browser msedge` in `~/.claude.json` (takes effect next session). Edge screenshot scripts live in `.playwright-mcp/` (git-ignored).
- If Playwright hangs on `newPage`, look for orphaned automation browsers (`ps … | grep remote-debugging-pipe`) and kill them. Keep the Mac awake with `caffeinate -i` during long runs; sleep killed several agents.

## Design rules (set by the owner)

1. **No rounded cards** unless Astryx requires it. Buttons keep their radius.
2. **No horizontal dividers**: no `hasDividers`, no `<Divider />`, no row rules. Tables use `dividers="none"` with `isStriped`.
3. **No dark text on dark backgrounds.** `.om-band` forces its children to inherit a light colour.
4. **Buttons aren't full width.** Each screen has one primary action docked at the bottom (`.om-cta-dock`): up to 512px, 56px tall, display font, uppercase. Other buttons use Astryx's `md` size and the Cabin font.
5. **Mobile-ready.** Check at 390px and 1280px in Edge, with no sideways scrolling. The header's file actions become icon-only at ≤768px.
6. **Match the Hobgoblin army builder** for flow and interaction (see `notes/hobgoblin-flow.md`).
7. **Back goes up a level, never off the site.**
8. **Icons are never clipped.** Book marks carry their own `box` (viewBox) in `src/icons/marks.json`.
9. **The app writes no prose of its own.** Labels come from the book's vocabulary.

**Type:** Cabin for the interface, Almendra SC for headings and CTAs, EB Garamond (`.om-prose`) for the book's own text. The landing title uses Astryx `display-1`. There is no mono font.

**Palette:**

| Name | Hex | Role |
|---|---|---|
| Floral White | `#FFF9EC` | page |
| Blackberry | `#5D2A42` | text and accent |
| Powder Blush | `#FCB1A6` | borders |
| Almond Silk | `#FFDCCC` | muted fill |
| Bubblegum | `#FB6376` | fill only, never used for text |

Corner radius is the Astryx default (4px); cards override it to 0.

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
src/Shell.jsx     the three-region frame (library | content | detail)
src/panes/        one per section
src/theme/        marches.ts is the source; run `npx astryx theme build src/theme/marches.ts`. paper.css holds the app's own rules.
```

Seven PDF errata are recorded in `oathmark.json` under `errata`, with reasoning.

## Done this session

- Pushed to GitHub with Pages deploy, and added the shared WarLore footer (`data-current="oathmark"`). Oathmark was also added to the `Type37/warlore-footer` tool list.
- Fixed a build error (a stray comma in KingdomPane), and a crash in Create Kingdom: Astryx's `Selector` needs its `options` passed as data, not as child elements.
- Browser Back now goes up a level. Landing cards read Found a Kingdom (laurel crown), Muster an Army (banner icon) and Unit Collections. The kingdom list shows 3 across, with Found a Kingdom docked at the bottom.
- Applied the design rules above: square cards, no dividers, phone margins (a bleeding `Section` was removed from KingdomPane), and a compact header on phones.

## Next, in order

1. **Clickable equipment, attributes and stats** (about 2 hours). Hand Weapon, Shield, Heavy Armour and the rest (15 equipment names in `figures[].equipment`), every attribute, and every stat open their explanation: a popover on desktop, a bottom sheet on phones, the same as Hobgoblin's keywords. Equipment definitions aren't in `oathmark.json` yet; extract them from the book (around p44–48).
2. **Selectable points options per unit** (about 1 hour). Show unit options and upgrades as radio or checkbox rows with the cost on the right, like Hobgoblin's TYPE list.
3. **Routes per record**, e.g. `#/kingdom/:id` and `#/muster/:id/u/:unitId`, so each screen can be deep-linked.
4. **A muster list with a docked "Muster an Army" CTA.** The Muster screen is empty until a kingdom is loaded.
5. **Unit Collections** currently opens the Reference pane (attributes, spells, items). Decide whether it should open Collection instead.
6. Carried over from before: characters joining units, choosing spells and magic items, the p218 roster print view, regions 5–6 and campaign play.

## Known issues

- The main JS chunk is 3.3 MB (590 KB gzipped), because `Ico.jsx` loads the whole pepicons set. Import only the icons used.
- There's no error boundary, so one crash blanks the whole app.
- The Region map puts small "1/2" labels on Bubblegum, which conflicts with the fill-only rule.
- The Actions workflow gets a Node 20 deprecation warning; bump `checkout`/`setup-node`/`upload-pages-artifact`/`deploy-pages` to their latest majors.
- `src/screens/KingdomBuilder.jsx`, `Muster.jsx`, `Collection.jsx` and `Saves.jsx` are dead code and safe to delete. `Chronicle.jsx` is still used.
- Auth and cloud save are still undecided: Supabase, a serverless function, or none. JSON export/import already works.

## Source

`Oathmark-2e-small.pdf` is the owner's purchased ebook. It's watermarked to the buyer, git-ignored, and must never be committed. All data was extracted from it, with page numbers.
