# Typography — dashes and the middle dot

Sources: Butterick, *Practical Typography*, "Hyphens and dashes"
(https://practicaltypography.com/hyphens-and-dashes.html); Wikipedia, "Interpunct"
(https://en.wikipedia.org/wiki/Interpunct); type.today, "Manual: •.,:;…!?·"
(https://type.today/en/journal/dots).

## Hyphen `-` U+002D

- Word breaks at end of line.
- Multi-part words: `cost-effective`, `topsy-turvy`.
- Phrasal adjectives, for clarity: `listener-supported radio`, `high-school grades`.
- Compound surnames: `Mr. & Mrs. Sarbanes-Oxley` takes a hyphen, not an en dash.

Not with `-ly` adverbs (`a badly worded rule`, no hyphen), and not in multi-part
foreign terms used as adjectives.

## En dash `–` U+2013

Two jobs only:

- Ranges: `1880–1912`, `pages 330–39`, `Levels 1–5`, `Exhibits A–E`.
- Connection or contrast between a pair: `conservative–liberal split`,
  `Sarbanes–Oxley Act`, `Arizona–Nevada reciprocity`.

Set flush, no spaces.

## Em dash `—` U+2014

Butterick's test: "Use it when a comma is too weak, but a colon, semicolon, or
pair of parentheses is too strong."

- Parenthetical break with force: `The knucker—500pts—needs a 2,500pt army.`
- Abrupt turn or interruption.
- Appositive that already contains commas: `Three capitals—Dwarf, Elf and Orc—grant a General.`
- Before an attribution or a summarising clause.

Set flush by default; word spaces around it are acceptable when it looks crushed
on screen. Never approximate it with `--` or `---`. One pair per sentence is the
ceiling; past that, parentheses or a full stop.

Butterick's note worth keeping: the em dash is *underused* in professional
writing, so stripping them out on suspicion is its own error.

## Middle dot `·` U+00B7

Also interpunct, middot, raised dot. It is a punctuation mark, not a graphic
marker. It matches the period in size and sits at x-height.

Legitimate uses:

- Separating items in a list or byline on one line: `Region 2 · Dwarf`.
- Mathematics: multiplication and dot products.
- Chemistry: `CuSO4·5H2O`.
- Catalan geminate l: `col·legi`, `cel·la`.
- Interword separation in Korean and Japanese typography, and Chinese
  transliterated names.
- Phonetics, Americanist notation for vowel length.

Never a bullet. Per type.today: "the bullet is a graphic marker, while the
interpunct is a punctuation mark." Bullets are U+2022 `•`, larger and heavier,
and the technical convention is that bullets must not be replaced with
interpuncts. Do not use a middle dot inside a running sentence either — it means
"these are separate fields," which is why it works in a table cell and fails in
a paragraph.

Distinct characters not to confuse: U+2027 hyphenation point (dictionary
syllabification), U+22C5 dot operator (maths), U+0387 Greek ano teleia,
U+30FB katakana middle dot, U+2E31 word separator middle dot. For a UI list
separator the correct character is U+00B7.

Spacing: no published measurement. A hair or thin space either side reads best;
in HTML a normal word space is fine. Glyph shape and sidebearings vary a lot by
typeface, so check the font rather than assuming.

## The trap in our own output

A middle dot implies real, separate data fields. `Fast · Reliable · Secure` is
three adjectives dressed as metadata, and that reads as machine-generated.
`15pts · 4 units` is three real fields, so it earns the separator.
