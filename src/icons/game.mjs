import laurel from "./laurel-crown.svg?raw";
import muster from "./muster.svg?raw";
import rank1 from "./rank-1.svg?raw";
import rank2 from "./rank-2.svg?raw";
import rank3 from "./rank-3.svg?raw";
import dice from "./dice-2d6.svg?raw";

const fromSvg = (svg) => ({ body: svg.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, ""), width: 512, height: 512 });

export const LAUREL = fromSvg(laurel);
export const MUSTER = fromSvg(muster);
export const RANK = { beginner: fromSvg(rank1), moderate: fromSvg(rank2), expert: fromSvg(rank3) };
// Font Awesome's two dice are 640 wide.
export const DICE = { ...fromSvg(dice), width: 640 };
