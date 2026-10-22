#!/usr/bin/env node
// Catalog entry name is a path under the repo root (here "skills"); files are relative to it
// and must cover every file in each skill folder (skills/<id>/...).
import fs from "node:fs";
import path from "node:path";

const idx = JSON.parse(fs.readFileSync("index.json", "utf8"));
let bad = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const s of idx.skills) {
  if (!/^\d+\.\d+\.\d+$/.test(s.version)) { console.error(`${s.name}: version "${s.version}" is not semver`); bad++; }
  const root = s.name;
  const actual = walk(root).map((f) => path.relative(root, f).split(path.sep).join("/")).sort();
  const listed = [...s.files].sort();
  for (const f of actual) if (!listed.includes(f)) { console.error(`${f} missing from index.json`); bad++; }
  for (const f of listed) if (!actual.includes(f)) { console.error(`${f} listed but absent`); bad++; }
  for (const f of actual.filter((f) => f.endsWith("/SKILL.md"))) {
    const id = f.split("/")[0];
    const m = /^name:\s*(.+)$/m.exec(fs.readFileSync(path.join(root, f), "utf8"));
    if (!m || m[1].trim() !== id) { console.error(`${f}: name must equal folder "${id}"`); bad++; }
  }
}
if (bad) process.exit(1);
console.log("OK: catalog");
