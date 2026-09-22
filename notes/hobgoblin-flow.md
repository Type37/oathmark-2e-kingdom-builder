# Hobgoblin army builder: user flow reference

Source: https://hobgoblin.indietabletop.club/army, walked in Edge at 1280×800 and 390×844 on 2026-09-22. Screenshots are in `notes/hobgoblin/` (git-ignored).

## Routes

Every screen has its own URL, so the browser's Back button always goes up one level.

| Route | Screen |
|---|---|
| `/army` | Army list |
| `/army/a/:armyId` | Army: header, description, list of units |
| `/army/a/:armyId/u/:unitId` | Army and unit together. On desktop the unit opens in the right-hand pane; on a phone it replaces the whole screen. |
| `/print/a/:armyId` | Print view |
| `/account` | Account |

## Flow

1. **Empty list.** Illustration, "No armies yet" and one line of help. Two stacked actions: a filled **CREATE SAMPLE ARMIES** button and a text-only **CREATE ARMY** below it (`01-empty-desktop.png`).
2. **Army list.** White cards, 325×128, three across on desktop and one per row on a phone. Each card shows the name in the display font and "3000pts, 9 units" in small serif. The whole card is a link. **CREATE ARMY** is docked at the bottom (`10-list-desktop.png`, `20-list-phone.png`).
3. **Army.** A back arrow labelled "ARMY" and a ⋯ menu at the top, then an illustration, the name (display face, about 40px), "3000pts, 7 units", pill buttons **SHARE** and **PRINT**, and the army description. Units are listed as cards: name, a role icon (★ general, ⚑ standard), "(x2)" for multiples, then the points and type followed by the keywords in italic. **ADD UNIT** is docked at the bottom (`11-army-open-desktop.png`).
4. **Unit.**
   - A close ✕ labelled "UNIT" and a ⋯ menu at the top.
   - Name, type, and a round dark badge with the points ("525 POINTS").
   - A 3×2 grid of stats (SPEED, RANGE, STRIKES, COURAGE, FOOTPRINT, MULTIPLIER). **Every stat is a button.**
   - A "Look up target numbers ›" row, then a flavour paragraph.
   - **ADD CURSED ARTEFACT** as an outlined white button.
   - One card per keyword: name, an ✕ to remove it, the rules text, and a grey note saying where the keyword came from ("Purchased for 75pts", "Added by the General keyword").
   - **PURCHASE KEYWORDS** docked at the bottom (`12-unit-open-desktop.png`, `22-unit-phone.png`).
5. **Adding a unit** opens a form modal titled "Unit": NAME, DESCRIPTION, then TYPE as a list of radio rows, each showing its points on the right ("Light Infantry 300pts"). The modal's own **ADD UNIT** submit is docked at its bottom (`16-add-unit-desktop.png`, `24-addunit-phone.png`).
6. **Buying keywords** opens a modal with two tabs, STRENGTHS and WEAKNESSES. It shows the cost multiplier ("1x keyword cost multiplier") above a list of checkboxes, one per keyword (`15-purchase-keywords-desktop.png`).

## Interactions

| Trigger | Surface | Desktop | Phone | Dismiss |
|---|---|---|---|---|
| Stat button (e.g. SPEED 6) | Small centred modal: title, definition, a divider, then what modifies the stat ("Stat not modified via keywords.") | 384 px wide, 16 px radius, white, page dimmed | same | ✕, backdrop, Esc |
| Keyword name in running text (italic, dotted underline) | **Dark popover sheet**: small caps "KEYWORD", then the name, the rule, notes | Anchored top right, 384 px, dark `#19262e`, light text | Bottom sheet, full width, page dimmed | ✕, backdrop |
| ADD UNIT | Form modal | 640×720, centred, 16 px radius | Full screen | ✕ |
| PURCHASE KEYWORDS | Checklist modal with tabs | 640×720 | Full screen | ✕ |
| Unit card | Route change to `/u/:id` | Right-hand pane | Full screen with a back arrow | Back or ✕ |
| SHARE / PRINT | Share action; print is a separate route | pills, 33 px tall | same | — |

Rules and definitions are **always one tap away**: stat labels are buttons and keyword names are inline links. None of this is visible only on hover.

## Measured tokens

| Token | Value |
|---|---|
| Primary / dark | `#19262e` (sidebar, docked CTA, popover) |
| Page background | light grey, about `#ebebeb` |
| Cards | white, **8 px radius**, no border, no shadow, 16–20 px padding |
| Modals | white, 16 px radius, 24 px padding |
| Body type | Minion Pro, 16px; keywords 14px italic |
| Display type | custom blackletter-ish display face for titles and card names |
| Button labels | display face, **14px, uppercase**, letter-spaced |
| Docked CTA | 56 px tall, 8 px radius. Desktop: 512 px wide on the list, the column width inside the army (499), sits 40 px above the viewport bottom. Phone: full width minus 12 px gutters, 12 px from the bottom. |
| Stat labels | display face, 12px, uppercase |
| Phone gutters | 12 px |
| Desktop frame | 120 px dark rail on the left (logo, MENU, account) + content |

## Phone vs desktop

- On desktop the army and the unit sit side by side. On a phone each is its own full screen with a dark top bar (back arrow, title, ⋯).
- Keyword explanations: an anchored dark card on desktop, a bottom sheet on a phone.
- Form modals: centred 640 px on desktop, full screen on a phone.
- The docked CTA stays in view on every screen at both widths.

## What we copy for Oathmark

1. **Routes for everything** (`#/kingdoms`, `#/kingdom/:id`, `#/muster/:id`, `#/muster/:id/u/:unitId`), so Back goes up one level.
2. **One docked primary CTA per screen**: Found a Kingdom, Muster an Army, Add Unit.
3. **Equipment and attributes as inline links.** Hand Weapon, Shield and Heavy Armour, and every attribute, open a small explanation: a popover on desktop, a bottom sheet on a phone.
4. **Stats as buttons**, each opening its definition from the book.
5. **Unit points options as radio rows with the points on the right**, as in Hobgoblin's TYPE list. Upgrades are checkbox rows that show their cost.
6. **Keyword cards on the unit** that say where each came from ("Option: Chariot +110pts").
