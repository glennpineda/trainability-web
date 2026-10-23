/**
 * The team, from Studio.
 *
 *   npm run team
 *
 * Staff and trainer names, titles, bios, photos and locations come from
 * Studio, never from this repo (Glenn, 23 Oct 2026). Studio publishes them
 * without a sign-in:
 *
 *   GET /api/forms/team              everyone active, as trainers and staff:
 *   GET /api/forms/team/<id>/photo   a trainer is anyone who trained a client in
 *                                    the past 90 days (or has the trainer role);
 *                                    locations are where they trained in those
 *                                    90 days, else their default place
 *
 * Until Studio has /api/forms/team, this falls back to what it had before: the
 * trainers its PT form offers (/api/forms/ptinquiry) and each one's public
 * trainer page (/api/trainer-page/<slug>), with no staff.
 *
 * Writes src/team.json (with Studio's places, in its order, for the team page's
 * filter, and each place's opening hours where Studio has them) and
 * assets/team/; the build turns them into the team page and the hours shown
 * across the site. Run it before a build when the team or hours change in Studio.
 */
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STUDIO = process.env.STUDIO_ORIGIN || "https://trainabilitystudio.com";
const PHOTOS = join(ROOT, "assets", "team");

async function json(path) {
  const r = await fetch(STUDIO + path);
  if (!r.ok) throw Object.assign(new Error(`${path}: ${r.status}`), { status: r.status });
  return r.json();
}

/* A photo saved under a file name made from the person's name, so the files read
   as who they are. Null when Studio has none. */
async function savePhoto(path, name) {
  if (!path) return null;
  const r = await fetch(STUDIO + path);
  if (!r.ok) return null;
  const type = r.headers.get("content-type") || "";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const file = `${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.${ext}`;
  writeFileSync(join(PHOTOS, file), Buffer.from(await r.arrayBuffer()));
  return `assets/team/${file}`;
}

const person = async (p) => ({
  name: p.name,
  title: p.title || "",
  bio: p.bio || "",
  locations: p.locations || [],
  photo: await savePhoto(p.photo, p.name),
});

/* A place's week as Studio gives it (seven days, Sunday first, each
   { open, close } in minutes past midnight or null for closed) made into
   [open, close] pairs. Null when Studio has no hours for it, or doesn't send any. */
const week = (hours) => Array.isArray(hours) && hours.length === 7
  ? hours.map((d) => (d ? [Number(d.open), Number(d.close)] : null))
  : null;

/* Studio's team list: trainers and staff, as Studio sorts them. */
async function fromTeamList() {
  const d = await json("/api/forms/team");
  const trainers = [];
  for (const p of d.trainers) trainers.push(await person(p));
  const staff = [];
  for (const p of d.staff) staff.push(await person(p));
  const hours = Object.fromEntries(d.places.map((p) => [p.name, week(p.hours)]).filter(([, w]) => w));
  return { source: "/api/forms/team", places: d.places.map((p) => p.name), hours, trainers, staff };
}

/* Before Studio had the team list: trainers only, from the PT form and trainer pages. */
async function fromTrainerPages() {
  const form = await json("/api/forms/ptinquiry");
  const places = Object.fromEntries(form.places.map((p) => [p.id, p.name]));
  const order = form.places.map((p) => p.name);
  const trainers = [];
  for (const t of form.trainers) {
    const slug = t.pagePath?.split("/").pop();
    const page = slug ? (await json(`/api/trainer-page/${slug}`).catch(() => null))?.page : null;
    trainers.push(await person({
      name: t.name,
      title: page?.title || t.title,
      bio: page?.bio,
      locations: t.placeIds.map((id) => places[id]).filter(Boolean).sort((a, b) => order.indexOf(a) - order.indexOf(b)),
      photo: page?.hasPhoto ? `/api/trainer-page/${slug}/photo` : null,
    }));
  }
  return { source: "/api/forms/ptinquiry + /api/trainer-page", places: order, trainers, staff: [] };
}

rmSync(PHOTOS, { recursive: true, force: true });
mkdirSync(PHOTOS, { recursive: true });

let team;
try {
  team = await fromTeamList();
} catch (e) {
  if (e.status !== 404) throw e;
  console.log(`Studio has no /api/forms/team yet; using its trainer pages (trainers only).`);
  team = await fromTrainerPages();
}

writeFileSync(join(ROOT, "src", "team.json"),
  JSON.stringify({ from: STUDIO + team.source, fetchedAt: new Date().toISOString(), places: team.places, hours: team.hours || {}, trainers: team.trainers, staff: team.staff }, null, 2) + "\n");
console.log(`${team.trainers.length} trainers: ${team.trainers.map((t) => t.name).join(", ")}`);
console.log(`Hours from Studio: ${Object.keys(team.hours || {}).join(", ") || "none (the site's own are used)"}`);
console.log(`${team.staff.length} staff${team.staff.length ? ": " + team.staff.map((t) => t.name).join(", ") : ""}`);
