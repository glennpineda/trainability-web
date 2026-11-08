/**
 * Draws assets/billy/billy-lockup.svg: Billy's face beside BILLY, laid out like
 * the Studio 3 lockup (assets/logos/studio-lockup.svg) so the three app cards
 * on Our Story match. The letters are the TRAINABILITY® wordmark's own
 * (assets/logos/trainability-wordmark-white.svg), the lettering Studio's
 * lockup uses too, in a purple to blue gradient.
 *
 * Also assets/billy/billy-wordmark.svg, the word alone, for where his name
 * stands in a heading ("Ask BILLY" on the chat, "Meet BILLY." on his page).
 *
 *   node scripts/billy-wordmark.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const word = readFileSync(join(ROOT, "assets/logos/trainability-wordmark-white.svg"), "utf8").match(/ d="([^"]+)"/)[1].split(/(?=M)/);
const r = (n) => Math.round(n * 10) / 10;
/* A letter of the wordmark, moved to start at x 0 and with y from 0 (top) to 740 (baseline). */
const lift = (path, dx) => path.replace(/(-?\d+(?:\.\d+)?)[ ,]?(-?\d+(?:\.\d+)?)|([VH])(-?\d+(?:\.\d+)?)/g, (all, x, y, cmd, v) =>
  cmd ? cmd + (cmd === "H" ? r(+v - dx) : r(+v + 740)) : `${r(+x - dx)} ${r(+y + 740)}`);

const glyphs = {
  B: { w: 599, path: word[9] + word[10] + word[11], left: 4778 },
  I: { w: 189, path: word[12], left: 5601 },
  L: { w: 499, path: word[13], left: 6059 },
  Y: { w: 653, path: word[16], left: 8033 },
};
/* The wordmark's own spacing where it has the pair (B I, I L); 215 between the L's, less before the Y, whose arms reach out over the L's open side. */
const gap = { BI: 224, IL: 269, LL: 215, LY: 140 };
let x = 0, prev = "";
const parts = [..."BILLY"].map((ch) => {
  if (prev) x += gap[prev + ch];
  /* Moved in its own outline, not by a transform, so the gradient runs across the whole word rather than starting again in each letter. */
  const { path, left, drawn } = glyphs[ch];
  const g = `<path d="${drawn ? drawn.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)|H(-?\d+(?:\.\d+)?)/g, (all, px, py, h) => h ? `H${+h + x}` : `${+px + x} ${py}`) : lift(path, left - x)}"/>`;
  x += glyphs[ch].w; prev = ch;
  return g;
});

const gradient = (id) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${x}" y2="0"><stop offset="0" stop-color="#A54BC9"/><stop offset="0.25" stop-color="#A54BC9"/><stop offset="1" stop-color="#3D9DE6"/></linearGradient>`;
/* As in Studio's lockup: the badge 228 tall, the letters 92 tall (scale 0.12432) on a baseline at 166, starting 268 in. */
const S = 0.12432, LEFT = 268, width = r(LEFT + x * S + 8);
/* Billy's face, its head cropped to fill the badge's square, animations and all. */
const face = readFileSync(join(ROOT, "assets/billy/normal.svg"), "utf8")
  .replace(/^<svg[^>]*>/, '<svg x="0" y="0" width="228" height="228" viewBox="4 4 92 92" overflow="visible">');
writeFileSync(join(ROOT, "assets/billy/billy-lockup.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 228" role="img" aria-label="Billy"><title>Billy</title>` +
  `<defs>${gradient("billy-word")}</defs>` +
  face.trim() +
  `<g transform="translate(${LEFT} 74) scale(${S})" fill="url(#billy-word)" fill-rule="evenodd">${parts.join("")}</g></svg>\n`);
console.log(`assets/billy/billy-lockup.svg: ${width} × 228`);
writeFileSync(join(ROOT, "assets/billy/billy-wordmark.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -4 ${x + 12} 744" role="img" aria-label="Billy"><title>Billy</title><defs>${gradient("billy-word")}</defs>` +
  `<g fill="url(#billy-word)" fill-rule="evenodd">${parts.join("")}</g></svg>\n`);
console.log(`assets/billy/billy-wordmark.svg: ${x + 12} × 744`);
