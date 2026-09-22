# Requests, and where they stand

## Done

**Type and readability**
- Grenze Gotisch only at headline size; small labels, table bars and plates in Cabin capitals
- Stat conventions: `A 3+`, `M 6"`, `F −2`, `S −2`, `D 9+`, `CD` as a number under a d10 heading, Base as one number plus `mm`
- Special and Base columns on every stat table
- Ranges read `0"–20"`
- Equipment lists only what carries a rule: shields, spears, armour and plain weapons are gone
- Attributes are plain text, not chips, and still open their rule
- Level column no longer truncates to "L…"

**Names**
- Book of Knights & Ladies wired in: 15 cultures, 149 homelands, ruler pools per culture
- Roll picks a culture, then one of its homelands, then a ruler of that culture
- Culture weights: Cymric ×2, Children of Faeries ×0.25, everything else even
- Oathmark's own realms dropped from the pools
- Modern-looking places take older forms: Antiochia, Miklagard, Jylland, Aurelianum, Mediolanum, Byzacena, Kemetia and the rest
- Knave 2e names fill in when you found a kingdom without naming it
- Army-name randomiser removed

**Kingdom building**
- Rarity chips say "Rarity 3" and open the p18 rule with what it means for your capital
- Capital chosen and removed through the same picker as any territory; removing it clears the kingdom
- Regions past the capital stay shut, with "Establish your capital first."
- The sheet always draws all six rings; regions past your level are set back
- Found the Kingdom locks the start in and opens Regions 5 and 6
- Territories can be marked Occupied, carrying the p35 rule
- Open borders chip on the outermost region, with the p32 definition
- Territory picker holds its height; no more jumping on hover
- The book's own guidance sits where each choice is made: p17 for level and capital, p18 for terrain
- Rarity rules audited against the book; two bugs fixed, all 59 territories checked

**Army building**
- The roster is the page: unit cards with cost, formation, stat bar, options
- Characters are bought in their own right and join a unit, taking a slot and lending Command's Activation
- Spells behind "Add spells", with casting numbers and the level+2 limit
- Magic items behind a picker that shows what each one does, one per character, one of a kind per army
- Options state their effect (`M 8"`, `D 11+`, base `25 x 50mm`) and their cost by level band
- Muster starts with Battle Type: all six from pp29–32 in full, rolled on a d10 or chosen
- Points roll halves at Beginner, +2 at Expert; Uneven Battles rolls the p34 modifier

**Collection**
- Every figure in the book, in printed order, under jump tabs
- Plus and minus counters that save as you click
- Sorting by any column

**Look and feel**
- The book's logo, extracted from page 2 with its transparency
- Credit footer: the game and its author on the left, this builder and its links on the right
- The shared WarLore footer only on the front screens
- Dice tumble and bounce when rolled
- Red X in a ring for removal
- Paper texture removed
- Emblems: react-easy-crop with zoom and rotate, clicked from the header, faded on cards, a crest in print

**Under the hood**
- Bundle 3.5MB → 864KB: 7 icons instead of 1,286, 7 marks instead of 27, a chunk per page
- Offscreen collection sections skip layout
- One attribute dialog instead of a popover per chip
- Options page, reachable by the gear at top right and the ⋯ menu at top left
- Collection mode is opt-in; off means figures you don't own are never flagged

## Done, this round

- Options is a modal, opened from the gear or the app menu; the page is gone
- The credit footer is on every screen; the big WarLore footer only on the front ones
- Difficulty chevrons removed from cards and headers
- "Optional" no longer printed beside fields, so there is nothing there to click
- Emblem cropping rebuilt on react-avatar-editor, with the source downscaled to 1600px first so the canvas keeps up

## Open

1. **Print rebuild** — map beside the region ledger, occupied boxes, The Realm block, figures grouped by race. Audited, half-written.
2. **Muster modal polish** — plain boxes on a plain panel; the last screen ignoring the paper treatment.
3. **Army header** — "Points 1000" and "906/1000" say the same thing twice; the army name can't be edited where it's shown.
4. **Nekoweb copy** — whether to publish a second copy there.
5. **Knave's other tables** — inn names, factions, wizard names, missions.
6. **Occupied and Region 6 in the muster** — the engine records both; the army side doesn't yet apply +1 Activation or Unreliable.
7. **Campaign additions must share a border** with an unoccupied territory (p37).
8. **Legendary Heroes** (Appendix D).
9. **"We had a good thing before"** on unit cards — say which version and I'll restore it.
