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
 * styles.css, main.js and assets/ are copied as they are.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const version = pkg.codename ? `${pkg.version} · ${pkg.codename}` : pkg.version;
const site = JSON.parse(readFileSync(join(SRC, "site.json"), "utf8"));
const layout = readFileSync(join(SRC, "layout.html"), "utf8");

/* The team page's cards, from src/team.json (npm run team pulls it from Studio). */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const team = JSON.parse(readFileSync(join(SRC, "team.json"), "utf8"));
const cards = (people, root) => people.map((t) => `
      <article class="person">
        ${t.photo ? `<img src="${root}${t.photo}" alt="${esc(t.name)}" width="400" height="400" loading="lazy">` : `<div class="person-initials" aria-hidden="true">${esc(t.name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</div>`}
        <div class="person-body">
          <h3>${esc(t.name)}</h3>
          ${t.title ? `<p class="person-title">${esc(t.title)}</p>` : ""}
          ${t.locations.length ? `<p class="person-where">${t.locations.map(esc).join(" · ")}</p>` : ""}
          ${t.bio ? `<p>${esc(t.bio)}</p>` : ""}
        </div>
      </article>`).join("");
/* A section of the team page, left out when Studio lists nobody for it. */
const teamSection = (people, root, { id, eyebrow, heading, intro, alt }) => people.length ? `
    <section class="section${alt ? " section-alt" : ""}" id="${id}">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow gradient-text">${eyebrow}</p>
          <h2>${heading}</h2>
          <p>${intro}</p>
        </header>
        <div class="team">${cards(people, root)}
        </div>
      </div>
    </section>` : "";
const generated = {
  /* The jump buttons, only once there are staff to jump to. */
  teamJump: () => team.staff.length ? `
        <div class="hero-actions">
          <a href="#trainers" class="btn btn-ghost">Trainers</a>
          <a href="#staff" class="btn btn-ghost">Staff</a>
        </div>` : "",
  trainerSection: (root) => teamSection(team.trainers, root, { id: "trainers", eyebrow: "Trainers", heading: "Our trainers",
    intro: "Certified, independent and experienced: matched to your goals, at the location where they train." }),
  staffSection: (root) => teamSection(team.staff, root, { id: "staff", eyebrow: "Staff", heading: "Our staff", alt: true,
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
    const v = generated[k] ? generated[k](root) : { root, version, page: name, ...meta, ...site }[k];
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
