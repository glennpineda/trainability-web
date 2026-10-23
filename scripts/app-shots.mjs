/**
 * The app screenshots behind the Studio and Coach pages' heroes.
 *
 *   npm run app-shots
 *
 * Copied from each app's own manual screenshots, so the website shows the apps
 * as they are (Glenn, 23 Oct 2026: "keep updating these so it's always
 * consistent with the apps"). Run it whenever Studio or Coach changes the way
 * these screens look, and re-take the screenshots in the app first if its
 * manual's are out of date.
 *
 * Only screens with demo data: no real client's name, photo, email or phone.
 * Check a new screenshot for that before adding it to SHOTS.
 *
 * Each is cut (`crop`: keep the top so many pixels, e.g. to leave out a bottom
 * bar with somebody's photo in it), made 560 px wide and saved as a JPEG in
 * assets/apps/<app>-<name>.jpg. macOS only (sips, and swift for the crop).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "apps");
const STUDIO = process.env.STUDIO_REPO || join(homedir(), "Documents", "TrainabilityWeb3");
const COACH = process.env.COACH_REPO || join(homedir(), "Documents", "TrainabilityCoach1");

/* Left, middle (in front) and right, as each page shows them. */
const SHOTS = [
  { app: "studio", name: "schedule", from: join(STUDIO, "docs/images/02-schedule.png") },
  { app: "studio", name: "login", from: join(STUDIO, "docs/images/01-login.png") },
  /* Cut above the bottom bar, which has a member's photo. */
  { app: "studio", name: "momentum", from: join(STUDIO, "docs/shots-tmp/momentum.jpg"), crop: 880 },
  { app: "coach", name: "clients", from: join(COACH, "docs/images/05-clients.png") },
  { app: "coach", name: "login", from: join(COACH, "docs/images/01-login.png") },
  { app: "coach", name: "client", from: join(COACH, "docs/images/06-client-details.png") },
];

const sips = (...args) => execFileSync("sips", args, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const size = (file) => {
  const out = sips("-g", "pixelWidth", "-g", "pixelHeight", file);
  return { w: Number(out.match(/pixelWidth: (\d+)/)[1]), h: Number(out.match(/pixelHeight: (\d+)/)[1]) };
};

mkdirSync(OUT, { recursive: true });
let missing = 0;
for (const s of SHOTS) {
  if (!existsSync(s.from)) { console.error(`missing: ${s.from}`); missing++; continue; }
  const work = join(tmpdir(), `app-shot-${s.app}-${s.name}.png`);
  /* sips only crops around the middle, so the top is kept with crop-top.swift. */
  if (s.crop) execFileSync("swift", [join(ROOT, "scripts", "crop-top.swift"), s.from, work, String(s.crop)], { stdio: "inherit" });
  else copyFileSync(s.from, work);
  const dest = join(OUT, `${s.app}-${s.name}.jpg`);
  sips("--resampleWidth", "560", "-s", "format", "jpeg", "-s", "formatOptions", "78", work, "--out", dest);
  rmSync(work, { force: true });
  const { w, h } = size(dest);
  console.log(`${s.app}-${s.name}.jpg  ${w}×${h}  from ${s.from}`);
}
if (missing) process.exitCode = 1;
