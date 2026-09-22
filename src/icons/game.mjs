import laurel from "./laurel-crown.svg?raw";
import muster from "./muster.svg?raw";

const fromSvg = (svg) => ({ body: svg.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, ""), width: 512, height: 512 });

export const LAUREL = fromSvg(laurel);
export const MUSTER = fromSvg(muster);
