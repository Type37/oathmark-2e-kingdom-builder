import React from "react";
import pepicons from "../icons/ui.json";
import { LAUREL, MUSTER, RULE_BOOK, RANK, DICE, D10 } from "../icons/game.mjs";

// The theme's icon registry (astryx docs icons, "Theme Overrides"). Astryx's
// own names draw Pepicons Print, so every control in the system shares one
// hand; glyphs the system has no name for take an "app:" key.
const glyph = ({ body, width = 512, height = 512 }) => (
  <svg viewBox={`0 0 ${width} ${height}`} width="1em" height="1em" fill="currentColor"
       aria-hidden="true" dangerouslySetInnerHTML={{ __html: body }} />
);
const pep = (name) => glyph({ ...pepicons.icons[name], width: pepicons.width, height: pepicons.height });

export const icons = {
  close: pep("times"),
  arrowUp: pep("arrow-up"),
  arrowDown: pep("arrow-down"),
  menu: pep("menu"),
  wrench: pep("gear"),
  "app:back": pep("arrow-left"),
  "app:plus": pep("plus"),
  "app:minus": pep("minus"),
  "app:pen": pep("pen"),
  "app:print": pep("printer"),
  "app:laurel": glyph(LAUREL),
  "app:muster": glyph(MUSTER),
  "app:rule-book": glyph(RULE_BOOK),
  "app:dice": glyph(DICE),
  "app:d10": glyph(D10),
  "app:rank-beginner": glyph(RANK.beginner),
  "app:rank-moderate": glyph(RANK.moderate),
  "app:rank-expert": glyph(RANK.expert),
};
