/**
 * Tells IndexNow (Bing, Yandex and the others that share it) which pages
 * changed, right after a deploy, instead of waiting for them to crawl again.
 *
 * The pages are the sitemap's. Each page's built HTML is fingerprinted, and
 * only those that differ from the last ping are sent (all of them the first
 * time). What was sent is kept in .indexnow-sent.json, which isn't committed:
 * it's about what this machine last deployed. A failed ping keeps nothing, so
 * the next deploy tries those pages again. Run by deploy.sh; never fails it.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");
const STATE = join(ROOT, ".indexnow-sent.json");
const site = JSON.parse(readFileSync(join(ROOT, "src", "site.json"), "utf8"));
if (!site.indexNowKey) process.exit(0);

const base = new URL(site.siteUrl);
const urls = [...readFileSync(join(OUT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const hash = (url) => {
  const file = join(OUT, new URL(url).pathname, "index.html");
  return existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16) : "";
};

const sent = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const now = Object.fromEntries(urls.map((u) => [u, hash(u)]));
const changed = urls.filter((u) => sent[u] !== now[u]);
if (!changed.length) {
  console.log("IndexNow: no pages changed");
  process.exit(0);
}

try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: base.host,
      key: site.indexNowKey,
      keyLocation: `${base.origin}/${site.indexNowKey}.txt`,
      urlList: changed,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text().catch(() => "")}`.trim());
  writeFileSync(STATE, JSON.stringify(now, null, 2) + "\n");
  console.log(`IndexNow: told about ${changed.length} page(s)`);
} catch (err) {
  console.log(`IndexNow: not sent (${err.message}); the next deploy tries again`);
}
