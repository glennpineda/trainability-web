/**
 * Draws assets/momentum/momentum-wordmark.svg: MOMENTUM in the lettering of
 * the TRAINABILITY® wordmark (assets/logos/trainability-wordmark-white.svg).
 * That lettering is outlines, not a font, and has only the T and N of this
 * word, so those two are taken from it as they are; M, O, E and U are drawn
 * to match: 740 tall, 189-wide stems, 45-unit rounded outer corners, square
 * inner ones, and the wordmark's wide spacing.
 *
 *   node scripts/momentum-wordmark.mjs
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

/* A straight-sided letter: its outline's points, with outer corners rounded like the wordmark's. */
const outline = (pts, radius = 45) => {
  const n = pts.length, out = [];
  pts.forEach((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const turn = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]);
    if (turn <= 0) return out.push(`${out.length ? "L" : "M"}${r(p[0])} ${r(p[1])}`);
    const toward = (q) => { const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), k = Math.min(radius, len / 2.5) / len; return [p[0] + dx * k, p[1] + dy * k]; };
    const p1 = toward(a), p2 = toward(b), c = (q) => `${r(q[0] + (p[0] - q[0]) * 0.667)} ${r(q[1] + (p[1] - q[1]) * 0.667)}`;
    out.push(`${out.length ? "L" : "M"}${r(p1[0])} ${r(p1[1])}C${c(p1)} ${c(p2)} ${r(p2[0])} ${r(p2[1])}`);
  });
  return out.join("") + "Z";
};

const glyphs = {
  M: { w: 860, d: outline([[0, 0], [186, 0], [430, 354], [674, 0], [860, 0], [860, 740], [671, 740], [671, 305], [430, 654], [189, 305], [189, 740], [0, 740]]) },
  O: { w: 760, d: "M380 0C608 0 760 148 760 370C760 592 608 740 380 740C152 740 0 592 0 370C0 148 152 0 380 0ZM380 180C265 180 189 256 189 370C189 484 265 560 380 560C495 560 571 484 571 370C571 256 495 180 380 180Z" },
  E: { w: 560, d: outline([[0, 0], [560, 0], [560, 172], [189, 172], [189, 284], [520, 284], [520, 456], [189, 456], [189, 568], [560, 568], [560, 740], [0, 740]]) },
  N: { w: 606, d: lift(word[6], 3008) },
  T: { w: 587, d: lift(word[0], 40) },
  U: { w: 640, d: "M45 0H144C174 0 189 15 189 45V430C189 510 245 560 320 560C395 560 451 510 451 430V45C451 15 466 0 496 0H595C625 0 640 15 640 45V420C640 620 505 740 320 740C135 740 0 620 0 420V45C0 15 15 0 45 0Z" },
};
const GAP = 215, ROUND_GAP = 190;   // the wordmark's spacing; a little less beside the O, which looks farther away
let x = 0, prev = "";
const parts = [..."MOMENTUM"].map((ch) => {
  if (prev) x += prev === "O" || ch === "O" ? ROUND_GAP : GAP;
  const g = `<path transform="translate(${x} 0)" d="${glyphs[ch].d}"/>`;
  x += glyphs[ch].w; prev = ch;
  return g;
});
writeFileSync(join(ROOT, "assets/momentum/momentum-wordmark.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 740" role="img" aria-label="Momentum"><title>Momentum</title><g fill="#FFFFFF" fill-rule="evenodd">${parts.join("")}</g></svg>\n`);
console.log(`assets/momentum/momentum-wordmark.svg: ${x} × 740`);
