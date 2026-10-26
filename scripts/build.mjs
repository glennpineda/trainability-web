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

/* Umami, the site's cookie-free analytics: on only once site.json has the
   website ID from Umami Cloud, and counting only on trnblt.com (not the
   preview, not trainability.org before it forwards) */
const analytics = site.umamiWebsiteId
  ? `\n  <script defer src="https://cloud.umami.is/script.js" data-website-id="${site.umamiWebsiteId}" data-domains="trnblt.com"></script>`
  : "";
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
    <section class="section reviews" id="reviews" data-google-place="${esc(place)}" hidden>
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

/* Home: "What people say", three short quotes from our Google reviews
   (src/highlights.json, written into the page), and each location's rating
   and count, which main.js fills in live from Google like the location pages
   (nothing of Google's is kept here). Their space is held from the start. */
const highlights = JSON.parse(readFileSync(join(SRC, "highlights.json"), "utf8")).quotes;
const ratingChip = (place, name, page) => `
          <a class="rating-chip" href="https://search.google.com/local/reviews?placeid=${esc(place)}" data-rating-place="${esc(place)}" target="_blank" rel="noopener">
            <span class="rating-chip-place">${esc(name)}</span>
            <span class="stars" role="img" aria-label="5 out of 5 stars" hidden>★★★★★</span>
            <span class="rating-chip-figures">Reviews on Google</span>
          </a>`;
const homeReviews = (root) => `
    <section class="section home-reviews">
      <div class="container">
        <header class="section-head reviews-head">
          <p class="eyebrow gradient-text">From our Google reviews</p>
          <h2>What people say</h2>
          <div class="rating-chips">${site.googlePlacesKey ? ratingChip(site.missionGooglePlace, "Mission") + ratingChip(site.potreroGooglePlace, "Potrero Hill") : ""}
          </div>
        </header>
        <div class="reviews-list home-reviews-list">${highlights.map((q) => `
          <figure class="review">
            <span class="stars" role="img" aria-label="${q.rating} out of 5 stars" style="--rating: ${q.rating}">★★★★★</span>
            <blockquote><p>“${esc(q.quote)}”</p></blockquote>
            <figcaption><span class="review-who"><span>${esc(q.name)}</span><span class="review-when">${esc(q.place)}</span></span></figcaption>
          </figure>`).join("")}
        </div>
        <div class="hero-actions reviews-actions">
          <a class="btn btn-ghost" href="${root}mission/#reviews">Read Mission reviews</a>
          <a class="btn btn-ghost" href="${root}potrero-hill/#reviews">Read Potrero Hill reviews</a>
        </div>
      </div>
    </section>`;

const generated = {
  homeReviews,
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

/* What search engines and link previews read (scripts/build.mjs fills
   {{seo}} in the head). Every address is whole (https://trnblt.com/…):
   a preview card from iMessage, WhatsApp or Slack can't follow a relative
   one. */
const SITE = site.siteUrl.replace(/\/$/, "");
const pageUrl = (name) => `${SITE}/${name === "index" ? "" : `${name}/`}`;
const SHARE_IMAGE = `${SITE}/assets/photos/potrero/IMG_2926.jpg`;

/* Google's business details (schema.org), so search can show the gyms'
   addresses, phone and Potrero Hill's opening hours (from Studio). Mission is
   by appointment only, so it has no hours here. No reviews: Google ignores a
   business's own. */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const openingHours = (week) => week.flatMap((d, i) => d ? [{
  "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES[i], opens: hhmm(d[0]), closes: hhmm(d[1]),
}] : []);
const ORG = {
  "@type": "Organization", "@id": `${SITE}/#org`, name: "Trainability", url: `${SITE}/`,
  logo: `${SITE}/assets/logos/trainability-mark.png`, telephone: "+1-415-594-6019", slogan: "You belong here.",
  areaServed: { "@type": "City", name: "San Francisco" }, foundingDate: "2020",
};
const GYMS = {
  "potrero-hill": {
    "@type": "ExerciseGym", "@id": `${SITE}/potrero-hill/#gym`, name: "Trainability Potrero Hill",
    url: `${SITE}/potrero-hill/`, image: SHARE_IMAGE, telephone: "+1-415-594-6019", priceRange: "$$",
    description: "Open gym with personal training and reservable private studios in Potrero Hill, San Francisco.",
    address: { "@type": "PostalAddress", streetAddress: "180 Pennsylvania Ave", addressLocality: "San Francisco", addressRegion: "CA", postalCode: "94107", addressCountry: "US" },
    openingHoursSpecification: openingHours(team.hours?.["Potrero Hill"] || site.potreroHours),
    hasMap: `https://www.google.com/maps/search/?api=1&query=Trainability%20Potrero%20Hill&query_place_id=${site.potreroGooglePlace}`,
    parentOrganization: { "@id": `${SITE}/#org` },
  },
  mission: {
    "@type": "ExerciseGym", "@id": `${SITE}/mission/#gym`, name: "Trainability Mission",
    url: `${SITE}/mission/`, image: `${SITE}/assets/photos/mission/site-studio-gallery1-1-1024x684.jpg`,
    telephone: "+1-415-594-6019", priceRange: "$$",
    description: "Private one-on-one personal training studios in the Mission, San Francisco. By appointment only.",
    address: { "@type": "PostalAddress", streetAddress: "1470 Valencia St", addressLocality: "San Francisco", addressRegion: "CA", postalCode: "94110", addressCountry: "US" },
    hasMap: `https://www.google.com/maps/search/?api=1&query=Trainability%20Mission&query_place_id=${site.missionGooglePlace}`,
    parentOrganization: { "@id": `${SITE}/#org` },
  },
};
const structuredData = (name) => {
  const graph = name === "index" ? [ORG, GYMS.mission, GYMS["potrero-hill"]] : GYMS[name] ? [ORG, GYMS[name]] : null;
  return graph ? `\n  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>` : "";
};
/* The first big picture a page shows (its hero photo, or the home video's
   still), fetched first so the page appears sooner: it's a background image,
   which a browser otherwise finds late. */
const firstPicture = (name, raw, root) => {
  const m = raw.match(/--hero-image: url\('\{\{root\}\}([^']+)'\)/) || raw.match(/poster="\{\{root\}\}([^"]+)"/);
  return m ? `\n  <link rel="preload" as="image" href="${root}${m[1]}" fetchpriority="high">` : "";
};
const seo = (name, meta, picture = "") => {
  const hidden = meta.noindex === "yes";
  return [
    hidden ? `  <meta name="robots" content="noindex">` : `  <link rel="canonical" href="${pageUrl(name)}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:site_name" content="Trainability">`,
    `  <meta property="og:title" content="${esc(meta.title)}">`,
    `  <meta property="og:description" content="${esc(meta.description)}">`,
    hidden ? "" : `  <meta property="og:url" content="${pageUrl(name)}">`,
    `  <meta property="og:image" content="${SHARE_IMAGE}">`,
    `  <meta property="og:image:width" content="1024">`,
    `  <meta property="og:image:height" content="768">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
  ].filter(Boolean).join("\n") + structuredData(name) + picture;
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const pages = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"));
const listed = [];
for (const file of pages) {
  const raw = readFileSync(join(SRC, "pages", file), "utf8");
  const head = raw.match(/^<!--([\s\S]*?)-->\s*/);
  if (!head) throw new Error(`${file}: missing the settings comment at the top`);
  const meta = Object.fromEntries(
    head[1].trim().split("\n").map((l) => l.match(/^\s*(\w+):\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()])
  );
  for (const key of ["title", "description"]) if (!meta[key]) throw new Error(`${file}: no ${key}`);

  const name = file.replace(/\.html$/, "");
  /* The not-found page is shown at whatever address was mistyped, so its
     links start from the site's top (/) rather than ../ */
  const notFound = name === "404";
  const root = name === "index" ? "./" : notFound ? "/" : "../";
  const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (all, k) => {
    const v = generated[k] ? generated[k](root) : { root, version, page: name, seo: seo(name, meta, firstPicture(name, raw, root)), thisYear: String(new Date().getFullYear()), ...stamps, analytics, ...meta, ...site }[k];
    if (v === undefined) throw new Error(`${file}: unknown {{${k}}}`);
    return v;
  });

  const html = fill(layout.replace("{{content}}", raw.slice(head[0].length).trimEnd()));
  /* 404.shtml is the name this host (cPanel) shows for an address it can't
     find; 404.html in case it ever looks for that. */
  if (notFound) { for (const f of ["404.html", "404.shtml"]) writeFileSync(join(OUT, f), html); continue; }
  const dir = name === "index" ? OUT : join(OUT, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  if (meta.noindex !== "yes") listed.push(pageUrl(name));
}

/* For search engines: every page's address, and where to find that list. */
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`);
/* IndexNow (Bing and others): the key file at the site's top, proving the
   pings scripts/indexnow.mjs sends after a deploy come from this site */
if (site.indexNowKey) writeFileSync(join(OUT, `${site.indexNowKey}.txt`), site.indexNowKey);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* Old links still in use (site.json "redirects": old path -> page, or a full
   address elsewhere): a tiny
   page at the old address that forwards at once, keeping any ?query and
   #hash. A page, not a server rule, so nothing else in public_html (the other
   sites' folders) is affected. */
for (const [from, to] of Object.entries(site.redirects || {})) {
  const dir = join(OUT, from);
  // A full address (https://…) leaves the site; anything else is a page here
  const target = /^https?:/.test(to) ? to : "../".repeat(from.split("/").length) + to;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${target}">
<title>Moved – Trainability</title>
<script>location.replace("${target}" + location.search + location.hash);</script>
</head>
<body><p>This page has moved: <a href="${target}">continue</a>.</p></body>
</html>
`);
}

for (const f of ["styles.css", "main.js", "assets"]) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });
/* The server rules (https, no www, caching): see the file itself. */
cpSync(join(ROOT, "htaccess"), join(OUT, ".htaccess"));
console.log(`Built ${pages.length} pages into dist/ (${version})`);
