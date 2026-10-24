/**
 * Builds the site into dist/.
 *
 *   npm run build
 *
 * Each page in src/pages/ is the middle of a page; src/layout.html is the rest
 * (head, header, footer), so the menu and footer are written once. A page
 * starts with a comment block of settings:
 *
 *   <!--
 *   title: Personal Training – Trainability
 *   description: One sentence for search results.
 *   -->
 *
 * src/pages/index.html becomes dist/index.html; any other name.html becomes
 * dist/name/index.html, so links read /name/. Links inside pages are written
 * with {{root}} in front ({{root}}team/), which becomes the right number of
 * "../" for the page's depth — the site then works from any folder on the host.
 *
 * styles.css, main.js and assets/ are copied as they are. Pages link to
 * styles.css, main.js and hexes.js with a fingerprint of the file
 * (styles.css?v=1a2b3c4d), so a browser fetches the new one as soon as it
 * changes instead of keeping an old copy next to a new page.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");

const fingerprint = (f) => createHash("sha256").update(readFileSync(join(ROOT, f))).digest("hex").slice(0, 8);
const stamps = { cssV: fingerprint("styles.css"), jsV: fingerprint("main.js"), hexesV: fingerprint("assets/hexes.js") };

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const version = pkg.codename ? `${pkg.version} · ${pkg.codename}` : pkg.version;
const site = JSON.parse(readFileSync(join(SRC, "site.json"), "utf8"));
const layout = readFileSync(join(SRC, "layout.html"), "utf8");

/* The team page's cards, from src/team.json (npm run team pulls it from Studio). */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const team = JSON.parse(readFileSync(join(SRC, "team.json"), "utf8"));
/* Partners who aren't in Studio (src/partners.json), shown in Our team after Studio's trainers. */
const partners = JSON.parse(readFileSync(join(SRC, "partners.json"), "utf8")).partners;
/* A place as the filter and the address name it: "Potrero Hill" is potrero-hill. */
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* Photos on the team page, or everyone's initials in a circle while the photos
   are being redone (Glenn, 23 Oct 2026): "teamPhotos" in site.json. */
const photoOf = (t) => (site.teamPhotos === false ? null : t.photo);
const cards = (people, root) => people.map((t) => `
      <article class="person" data-places="${(t.allLocations ? team.places || [] : t.locations).map(slug).join(" ")}">
        ${photoOf(t) ? `<img src="${root}${photoOf(t)}" alt="${esc(t.name)}" width="400" height="400" loading="lazy">` : `<div class="person-initials" aria-hidden="true">${esc(t.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</div>`}
        <div class="person-body">
          <h3>${esc(t.name)}</h3>
          ${t.title ? `<p class="person-title">${esc(t.title)}</p>` : ""}
          ${t.locations.length ? `<p class="person-where">${t.locations.map(esc).join(" · ")}</p>` : ""}
          ${t.bio ? `<p>${esc(t.bio)}</p>` : ""}
          ${t.link ? `<a class="link-arrow" href="${t.link.href.replace("{{root}}", root)}">${esc(t.link.label)}</a>` : ""}
        </div>
      </article>`).join("");
/* All / Mission / Potrero Hill, in Studio's order, under the trainers' heading.
   main.js makes it work; without script it stays hidden and everyone shows. */
const teamFilter = () => `
          <div class="team-filter" role="group" aria-label="Show the team at" hidden>
            <button type="button" data-filter="all" aria-pressed="true">All locations</button>${(team.places || []).map((p) => `
            <button type="button" data-filter="${slug(p)}" aria-pressed="false">${esc(p)}</button>`).join("")}
          </div>`;
/* A section of the team page, left out when Studio lists nobody for it. */
const teamSection = (people, root, { id, eyebrow, heading, intro, alt, after = "" }) => people.length ? `
    <section class="section${alt ? " section-alt" : ""}" id="${id}">
      <div class="container">
        <header class="section-head">
          ${eyebrow ? `<p class="eyebrow gradient-text">${eyebrow}</p>` : ""}
          <h2>${heading}</h2>
          <p>${intro}</p>${after}
        </header>
        <div class="team">${cards(people, root)}
        </div>
      </div>
    </section>` : "";
/* Potrero Hill's opening hours: Studio's (npm run team) when it has them, else
   site.json's. Mission is by appointment, so it has none on the site. */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const clock = (m) => {
  const h = Math.floor(m / 60) % 24, min = m % 60;
  return `${h % 12 || 12}${min ? `:${String(min).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};
/* Days with the same hours, Monday first, run together: "Mon–Fri", "6 AM – 9 PM". */
const hoursLines = (week) => {
  const order = [1, 2, 3, 4, 5, 6, 0], same = (a, b) => String(week[a]) === String(week[b]);
  const runs = [];
  for (const d of order) {
    const last = runs.at(-1);
    if (last && same(last.to, d)) last.to = d; else runs.push({ from: d, to: d });
  }
  return runs.map(({ from, to }) => ({
    days: from === to ? DAYS[from] : `${DAYS[from]}–${DAYS[to]}`,
    time: week[from] ? `${clock(week[from][0])} – ${clock(week[from][1])}` : "Closed",
  }));
};
const potrero = hoursLines(team.hours?.["Potrero Hill"] || site.potreroHours);

/* Google reviews for a location, above its Find us: an empty section main.js
   fills from Google (Places API) on each visit. Left out until site.json has
   the key and the place's Google id. */
const reviews = (place, name) => site.googlePlacesKey && place ? `
    <section class="section reviews" data-google-place="${esc(place)}" hidden>
      <div class="container">
        <header class="section-head reviews-head">
          <h2>What people say</h2>
          <p class="reviews-summary"></p>
        </header>
        <div class="reviews-list"></div>
        <div class="hero-actions reviews-actions">
          <a class="btn btn-ghost reviews-all" href="https://search.google.com/local/reviews?placeid=${esc(place)}">See all reviews on Google</a>
          <a class="btn reviews-write" href="https://search.google.com/local/writereview?placeid=${esc(place)}">Review ${esc(name)} on Google</a>
        </div>
        <p class="reviews-credit">Reviews from Google Maps</p>
      </div>
    </section>
` : "";

const generated = {
  missionReviews: () => reviews(site.missionGooglePlace, "the Mission"),
  potreroReviews: () => reviews(site.potreroGooglePlace, "Potrero Hill"),
  /* "Mon–Fri 6 AM – 9 PM · Sat–Sun 8 AM – 6 PM", on one line, on separate lines,
     or as the day pass dialog's boxes. */
  potreroHours: () => potrero.map((l) => `${l.days} ${l.time}`).join(" · "),
  potreroHoursBr: () => potrero.map((l) => `${l.days} ${l.time}`).join("<br>"),
  /* Where Potrero Hill's holiday hours go when there are any coming up: filled
     in the browser from Studio (main.js), since they change from day to day. */
  potreroSpecial: () => `<p class="hours-special" data-special-for="Potrero Hill" hidden></p>`,
  potreroHoursList: () => potrero.map((l) => `
      <div><dt>${l.days}</dt><dd>${l.time}</dd></div>`).join(""),

  /* The jump buttons, only once there are staff to jump to. */
  teamJump: () => team.staff.length ? `
        <div class="hero-actions">
          <a href="#trainers" class="btn btn-ghost">Our team</a>
          <a href="#staff" class="btn btn-ghost">Our staff</a>
        </div>` : "",
  /* Our team: the trainers, with Fuad (partners.json) (Glenn, 23 Oct 2026). */
  trainerSection: (root) => teamSection([...team.trainers, ...partners], root, { id: "trainers", heading: "Our team",
    intro: "Certified, independent and experienced: matched to your goals, at the location where they train.", after: teamFilter() }),
  staffSection: (root) => teamSection(team.staff, root, { id: "staff", heading: "Our staff", alt: true,
    intro: "The people who keep every visit seamless and personal." }),
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const pages = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const raw = readFileSync(join(SRC, "pages", file), "utf8");
  const head = raw.match(/^<!--([\s\S]*?)-->\s*/);
  if (!head) throw new Error(`${file}: missing the settings comment at the top`);
  const meta = Object.fromEntries(
    head[1].trim().split("\n").map((l) => l.match(/^\s*(\w+):\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()])
  );
  for (const key of ["title", "description"]) if (!meta[key]) throw new Error(`${file}: no ${key}`);

  const name = file.replace(/\.html$/, "");
  const root = name === "index" ? "./" : "../";
  const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (all, k) => {
    const v = generated[k] ? generated[k](root) : { root, version, page: name, ...stamps, ...meta, ...site }[k];
    if (v === undefined) throw new Error(`${file}: unknown {{${k}}}`);
    return v;
  });

  const html = fill(layout.replace("{{content}}", raw.slice(head[0].length).trimEnd()));
  const dir = name === "index" ? OUT : join(OUT, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

for (const f of ["styles.css", "main.js", "assets"]) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });
console.log(`Built ${pages.length} pages into dist/ (${version})`);
