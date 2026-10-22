#!/usr/bin/env node
// Validate a timeline: a .json file, or an .html file (injected data, else the demo SAMPLE).
// Usage: node scripts/validate.mjs <file.json|file.html>
import fs from "node:fs";
import vm from "node:vm";

const STATUS = ["proven", "corroborated", "inferred", "alleged", "disputed"];
const TIERS = ["user_material", "primary_record", "official_report", "sworn_testimony", "journalism", "reference", "unverified_social"];
const PRECISION = ["day", "month", "year", "approx", "relative", "unknown"];
const ENTITY_TYPES = ["person", "organization", "company", "law"];

function load(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!file.endsWith(".html")) return JSON.parse(text);
  const marker = "window.__TIMELINE_DATA__ = ";
  const i = text.indexOf(marker);
  if (i < 0) throw new Error("no __TIMELINE_DATA__ block found");
  const rest = text.slice(i + marker.length);
  if (rest.startsWith("/*__TIMELINE_DATA__*/ null")) {
    const s = text.indexOf("var SAMPLE = ");
    const e = text.indexOf("\n  };", s);
    if (s < 0 || e < 0) throw new Error("template has no SAMPLE block");
    return vm.runInNewContext("(" + text.slice(s + 13, e + 4) + ")");
  }
  const end = rest.indexOf(";\n");
  return JSON.parse(rest.slice(0, end));
}

// Sort key: year * 10000 + month * 100 + day, supporting negative (BCE) years.
function key(s) {
  const m = /^(-?\d{1,6})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  if (m[2] != null) {
    const mo = Number(m[2]);
    if (mo < 1 || mo > 12) return null;
    if (m[3] != null) {
      const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      const dim = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
      const d = Number(m[3]);
      if (d < 1 || d > dim) return null;
    }
  }
  const frac = Number(m[2] || 0) * 100 + Number(m[3] || 0);
  return y * 10000 + frac;
}

function validate(d) {
  const errs = [];
  const err = (m) => errs.push(m);
  const checkSources = (list, where) => {
    for (const s of list || []) {
      if (typeof s === "string") continue;
      if (!s.label) err(`${where}: source missing label`);
      for (const f of ["url", "archive_url"]) {
        if (s[f] != null && !/^https?:\/\//i.test(s[f])) err(`${where}: ${f} must be http(s)`);
      }
      if (s.source_tier != null && !TIERS.includes(s.source_tier)) err(`${where}: bad source_tier "${s.source_tier}"`);
    }
  };
  if (!d.title) err("missing title");
  const ids = new Set();
  const uniq = (id, where) => {
    if (!id) return err(`${where}: missing id`);
    if (ids.has(id)) err(`duplicate id "${id}"`);
    ids.add(id);
  };
  const entIds = new Set();
  for (const e of d.entities || []) {
    uniq(e.id, "entity");
    entIds.add(e.id);
    if (e.type && !ENTITY_TYPES.includes(e.type)) err(`entity ${e.id}: bad type "${e.type}"`);
    checkSources(e.sources, `entity ${e.id}`);
  }
  const evIds = new Set();
  const evKey = new Map();
  let prev = null;
  for (const ev of d.events || []) {
    uniq(ev.id, "event");
    evIds.add(ev.id);
    if (!ev.title) err(`event ${ev.id}: missing title`);
    if (ev.precision && !PRECISION.includes(ev.precision)) err(`event ${ev.id}: bad precision`);
    if (ev.status != null && !STATUS.includes(ev.status)) err(`event ${ev.id}: bad status "${ev.status}"`);
    if (ev.confidence != null && !(ev.confidence >= 0 && ev.confidence <= 1)) err(`event ${ev.id}: confidence not in 0-1`);
    for (const a of ev.actors || []) if (!entIds.has(a)) err(`event ${ev.id}: unknown actor "${a}"`);
    checkSources(ev.sources, `event ${ev.id}`);
    checkSources(ev.counter_sources, `event ${ev.id} counter_sources`);
    if (ev.start != null) {
      const k = key(ev.start);
      if (k == null) err(`event ${ev.id}: bad start "${ev.start}"`);
      else {
        if (prev != null && k < prev) err(`event ${ev.id}: out of chronological order`);
        prev = k;
        evKey.set(ev.id, k);
      }
    }
  }
  for (const l of d.links || []) {
    if (!evIds.has(l.from)) err(`link: unknown from "${l.from}"`);
    if (!evIds.has(l.to)) err(`link: unknown to "${l.to}"`);
    if (l.from === l.to) err(`link: self-link "${l.from}"`);
    if (evKey.has(l.from) && evKey.has(l.to) && evKey.get(l.from) > evKey.get(l.to)) err(`link ${l.from}->${l.to}: cause starts after its effect`);
    if (l.confidence != null && !(l.confidence >= 0 && l.confidence <= 1)) err(`link ${l.from}->${l.to}: confidence not in 0-1`);
  }
  if (d.eras != null) {
    if (!Array.isArray(d.eras)) err("eras: must be an array");
    else {
      let prevEnd = null;
      d.eras.forEach((er, i) => {
        const w = `era ${i + 1}`;
        if (!er || typeof er !== "object") { err(`${w}: must be an object`); return; }
        if (!er.label) err(`${w}: missing label`);
        const a = key(er.start || "");
        const b = key(er.end || "");
        if (a == null) err(`${w}: bad start "${er.start}"`);
        if (b == null) err(`${w}: bad end "${er.end}"`);
        if (a != null && b != null && b < a) err(`${w}: end before start`);
        if (a != null && prevEnd != null && a < prevEnd) err(`${w}: overlaps or is out of order`);
        if (b != null) prevEnd = b;
      });
    }
  }
  return errs;
}

function checkHtml(text) {
  const errs = [];
  for (const id of ["stage", "canvas", "links", "scalemode", "minimap", "mmThumb", "exp", "dossierBtn", "printBtn"]) {
    if (text.indexOf(`id="${id}"`) < 0) errs.push(`html: missing #${id}`);
  }
  const marker = "window.__TIMELINE_DATA__ = ";
  const i = text.indexOf(marker);
  if (i < 0) return errs;
  const rest = text.slice(i + marker.length);
  if (rest.startsWith("/*__TIMELINE_DATA__*/ null")) return errs;
  const end = rest.indexOf(";\n");
  const data = end < 0 ? rest : rest.slice(0, end);
  if (data.includes("<")) errs.push("html: literal '<' inside the injected JSON (use \\u003c)");
  if (data.includes("\u2028") || data.includes("\u2029")) errs.push("html: raw U+2028/U+2029 inside the injected JSON");
  if (text.includes("/*__TIMELINE_DATA__*/")) errs.push("html: placeholder token still present after injection");
  return errs;
}

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate.mjs <file.json|file.html>");
  process.exit(2);
}
let errs;
let text = "";
try {
  text = fs.readFileSync(file, "utf8");
  errs = validate(load(file));
  if (file.endsWith(".html")) errs = errs.concat(checkHtml(text));
} catch (e) {
  errs = [e.message];
}
if (errs.length) {
  console.error(errs.map((e) => "- " + e).join("\n"));
  process.exit(1);
}
console.log("OK: " + file);
