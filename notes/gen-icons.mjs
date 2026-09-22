// Rebuild src/icons/ui.json when a new Pepicons Print icon is needed.
//   node notes/gen-icons.mjs plus minus gear
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const set = require("@iconify-json/pepicons-print/icons.json");
const current = JSON.parse(fs.readFileSync("src/icons/ui.json", "utf8"));
const names = [...new Set([...Object.keys(current.icons), ...process.argv.slice(2)])].sort();

const icons = {};
for (const name of names) {
  if (!set.icons[name]) throw new Error(`No such icon: ${name}`);
  icons[name] = set.icons[name];
}
fs.writeFileSync("src/icons/ui.json", JSON.stringify({ prefix: set.prefix, width: set.width, height: set.height, icons }));
console.log(`${names.length} icons:`, names.join(" "));
