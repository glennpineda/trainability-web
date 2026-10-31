/**
 * Draws assets/momentum/momentum-hero.svg, the Momentum page's hero
 * background: sixteen days of showing up, each a bar a little taller than
 * the last, carried along a rising curve to the sixteenth, the Flex Pass,
 * in its own hot colours. Kept to the right, so the title on the left
 * stays easy to read.
 *
 *   node scripts/momentum-hero.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1600, H = 900, BASE = 840, N = 16, BAR = 42, STEP = 62, X0 = 560;
const r = (n) => Math.round(n * 10) / 10;
const mix = (a, b, t) => "#" + [0, 2, 4].map((i) => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - t) + parseInt(b.slice(1 + i, 3 + i), 16) * t).toString(16).padStart(2, "0")).join("");
// cerulean → magenta over the first fifteen; the sixteenth is the Flex Pass
const colour = (i) => (i < 8 ? mix("#007ba7", "#c44e9b", i / 7) : mix("#c44e9b", "#d81b7a", (i - 8) / 7));

const bars = [], tops = [];
for (let i = 0; i < N; i++) {
  const t = i / (N - 1), h = 110 + Math.pow(t, 1.35) * 610, x = X0 + i * STEP, y = BASE - h, last = i === N - 1;
  tops.push([x + BAR / 2, y]);
  bars.push(`<rect x="${x}" y="${r(y)}" width="${BAR}" height="${r(h)}" rx="10" fill="${last ? "url(#flex)" : colour(i)}" opacity="${r(0.28 + t * 0.62)}"${last ? ' filter="url(#glow)"' : ""}/>`,
    // a short trail behind each bar, as if it were moving forward
    `<rect x="${x - 70}" y="${r(y)}" width="70" height="10" rx="5" fill="url(#trail${i})"/>`);
}
const trails = Array.from({ length: N }, (_, i) =>
  `<linearGradient id="trail${i}"><stop offset="0" stop-color="${i === N - 1 ? "#ff6a3d" : colour(i)}" stop-opacity="0"/><stop offset="1" stop-color="${i === N - 1 ? "#ff6a3d" : colour(i)}" stop-opacity="${r(0.2 + (i / (N - 1)) * 0.5)}"/></linearGradient>`).join("");
// the rising curve through the tops of the bars, on into the top-right corner
const pts = [[X0 - 260, BASE - 40], ...tops.map(([x, y]) => [x, y - 34]), [W + 40, tops[N - 1][1] - 150]];
let curve = `M${pts[0][0]} ${pts[0][1]}`;
for (let i = 1; i < pts.length; i++) {
  const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], dx = (x1 - x0) / 2;
  curve += `C${r(x0 + dx)} ${r(y0)} ${r(x1 - dx)} ${r(y1)} ${r(x1)} ${r(y1)}`;
}

writeFileSync(join(ROOT, "assets/momentum/momentum-hero.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<linearGradient id="flex" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d81b7a"/><stop offset="1" stop-color="#ff6a3d"/></linearGradient>
<linearGradient id="path" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4fa8dc" stop-opacity="0"/><stop offset="0.45" stop-color="#dc77b9" stop-opacity="0.7"/><stop offset="1" stop-color="#ff6a3d"/></linearGradient>
<radialGradient id="halo" cx="${tops[N - 1][0]}" cy="${tops[N - 1][1]}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff6a3d" stop-opacity="0.35"/><stop offset="0.4" stop-color="#d81b7a" stop-opacity="0.12"/><stop offset="1" stop-color="#d81b7a" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-200%" y="-50%" width="500%" height="200%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="soft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
${trails}
</defs>
<rect width="${W}" height="${H}" fill="url(#halo)"/>
<line x1="0" y1="${BASE}" x2="${W}" y2="${BASE}" stroke="#262634" stroke-width="2"/>
${bars.join("\n")}
<path d="${curve}" fill="none" stroke="url(#path)" stroke-width="14" stroke-linecap="round" opacity="0.5" filter="url(#soft)"/>
<path d="${curve}" fill="none" stroke="url(#path)" stroke-width="4" stroke-linecap="round"/>
</svg>
`);
console.log("assets/momentum/momentum-hero.svg");
