/**
 * The build number, the same way Studio does it.
 *
 *   npm run build-number            what it is now, and what it would become
 *   npm run build-number -- --set   write it into package.json
 *
 * Major and minor are decided by hand, and each minor has a code name chosen
 * by Glenn (3.0 is "Ianthine"). The build is the commit count since the minor
 * began: `buildBase` in package.json is main's commit count at that moment.
 * 3.0 began with 2 commits, so its first commit is 3.0.1.
 *
 * The build (scripts/build.mjs) puts the label in every page's footer.
 *
 * A number that would go backwards (a branch bumped and then squashed) is
 * refused rather than written: the same build number must always mean the same
 * build. It stands still until the count catches up.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const PKG = new URL("../package.json", import.meta.url);
const raw = readFileSync(PKG, "utf8");
const pkg = JSON.parse(raw);

const counted = Number(execFileSync("git", ["rev-list", "--count", "HEAD"], { encoding: "utf8" }).trim());
const base = Number(pkg.buildBase) || 0;
const build = Math.max(0, counted - base);
const [major, minor, current] = pkg.version.split(".");
const next = `${major}.${minor}.${build}`;
const back = build < Number(current);
const label = (v) => (pkg.codename ? `${v} · ${pkg.codename}` : v);

if (!process.argv.includes("--set")) {
  console.log(`  now:  ${label(pkg.version)}`);
  console.log(`  next: ${label(next)}${next === pkg.version ? "  (already current)"
    : back ? "  (backwards — it would be refused)" : ""}`);
  console.log(`\nRun with --set to write it.`);
  process.exit(0);
}

if (back) {
  console.log(`${next} is behind ${pkg.version}, so nothing was written. It stands still`);
  console.log(`until the commit count catches up. To start a new minor, move it by hand.`);
  process.exit(0);
}

/* Replaced in place rather than re-serialised, so the diff is one line. */
const updated = raw.replace(`"version": "${pkg.version}"`, `"version": "${next}"`);
if (updated === raw && next !== pkg.version) {
  console.error(`Could not find "version": "${pkg.version}" in package.json — nothing written.`);
  process.exit(1);
}

if (next === pkg.version) {
  console.log(`Already ${label(next)} — nothing to do.`);
  process.exit(0);
}
writeFileSync(PKG, updated);
console.log(`${pkg.version} -> ${label(next)}`);
