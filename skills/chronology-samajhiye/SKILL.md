---
name: chronology-samajhiye
description: Turn messy text into a rendered causal timeline — "what happened when, and what led to what". Use when the user asks for a timeline, chronology, sequence of events, history of a subject, or a cause-and-effect breakdown, or shares event text and wants it visualized.
---

# Chronology Samajhiye

Turn a messy body of events — notes, articles, incident reports, transcripts, life stories — into a rendered, interactive causal timeline: a chronological spine of event cards connected by labeled causal arrows, delivered as a single self-contained HTML file.

Supporting files live beside this `SKILL.md`:

- `template.html` — the self-contained renderer (greyscale, dark mode, causal arrows, offline)
- `references/date-rules.md` — how to normalize dates and handle uncertainty
- `references/causality.md` — how to decide, label, and score causal links

## Workflow

1. **Get the raw material.** From the user's message, or from a file they point to (read it — meeting notes, articles, transcripts all work). If the input is genuinely ambiguous, ask at most 1–2 clarifying questions; otherwise proceed.
2. **Extract events.** Normalize dates and resolve relative expressions following `references/date-rules.md`. Build the **entity register first** (people, organizations, companies, documents — with their sources), then write events that reference them via `actors`. Record each event's provenance as you go (see Sourcing below).
3. **Identify causal links.** Following `references/causality.md`. Be conservative — an honest timeline with fewer links beats a confident lie.
4. **Build the timeline JSON** (schema below). Events **must be sorted chronologically** — the renderer uses array order, it does not sort. Undated events go where their anchor context places them.
5. **Render.** Copy `template.html` to `<output-dir>/<slug>.html`. In the copy, replace the exact text `/*__TIMELINE_DATA__*/ null` with your JSON object — and change nothing else. The injected JSON must be valid (double quotes, no trailing commas) and every `<` in it must be serialized as `\u003c` (a verbatim excerpt containing `</script>` or `<!--` would otherwise break the page's script block), and U+2028 / U+2029 must be serialized as `\u2028` / `\u2029`. Verify afterwards that the literal string `/*__TIMELINE_DATA__*/ null` no longer appears in the file, and if a `node` runtime is available and the repo's `scripts/validate.mjs` is present, run `node scripts/validate.mjs <file.html>` (otherwise just check that the injected object parses).
6. **Deliver.** Give the file path. Offer to open it (`start "" <file>` on Windows, `open` on macOS, `xdg-open` on Linux). Summarize the main causal chain in 2–4 chat bullets, and explicitly flag any inferred (dashed) links or date uncertainties. Mention the viewer supports `/` search, `#event-id` deep links, `[` / `]` to walk a causal chain from the focused card, and a dossier/print view.

Default output directory: `./chronology/` (create it if missing). Use the user's location if they specified one. File name: kebab-case slug of the title, max ~48 characters.

## Timeline JSON schema

```json
{
  "title": "Fall of the Roman Republic",
  "subtitle": "Optional one-line context shown under the title",
  "meta": {
    "last_verified": "2026-10-18",
    "methodology": "Optional: one or two sentences on how this timeline was assembled.",
    "extraction_notes": "Optional: caveats, disputed dates, known gaps.",
    "alternative_hypotheses": ["Optional: rival interpretations the sources support"]
  },
  "entities": [
    {
      "id": "ent_tiberius",
      "name": "Tiberius Gracchus",
      "type": "person",
      "role": "Tribune of the plebs",
      "sources": [
        { "label": "Wikipedia — Tiberius Gracchus", "url": "https://en.wikipedia.org/wiki/Tiberius_Gracchus" }
      ]
    },
    { "id": "ent_gaius", "name": "Gaius Gracchus", "type": "person", "role": "Tribune" }
  ],
  "events": [
    {
      "id": "evt_0133_tribune",
      "title": "Short event title",
      "description": "1–3 sentences of detail for the expanded card.",
      "start": "2020-03-15",
      "end": null,
      "date_label": null,
      "precision": "day",
      "actors": ["ent_tiberius"],
      "tags": ["politics"],
      "gap_before": null,
      "sources": [
        {
          "label": "Wikipedia — Treaty of Versailles",
          "url": "https://en.wikipedia.org/wiki/Treaty_of_Versailles",
          "locator": "lead section",
          "source_tier": "reference",
          "excerpt": "Verbatim words copied exactly from the page.",
          "archive_url": null,
          "is_pull_quote": false
        },
        { "label": "User-provided notes" }
      ],
      "status": "corroborated",
      "confidence": 0.9
    },
    {
      "id": "evt_0121_death",
      "title": "Short second event title",
      "description": "One more sentence of detail.",
      "start": "-0121",
      "end": null,
      "date_label": null,
      "precision": "year",
      "actors": ["ent_gaius"],
      "tags": ["politics"],
      "gap_before": null,
      "sources": [],
      "counter_sources": [
        { "label": "A source that contradicts or complicates this event" }
      ],
      "status": "disputed",
      "confidence": 0.9
    }
  ],
  "links": [
    { "from": "evt_0133_tribune", "to": "evt_0121_death", "label": "set precedent for", "confidence": 0.7 }
  ]
}
```

Field notes:

- `start` / `end`: ISO 8601 when known — `"2020"`, `"2020-03"`, `"2020-03-15"`; BCE years as negative (`"-0044"`); `null` when unknown. The renderer prettifies these for display.
- `date_label`: use when the date is relative or too fuzzy for ISO — e.g. `"soon after the crash"`, `"early 2020s"`. It replaces the date on the card.
- `precision`: `"day" | "month" | "year" | "approx" | "relative" | "unknown"`. `"approx"` renders with a `~` prefix.
- `entities`: registry of the people, organizations, companies, and documents the events involve — `{ id, name, type, role, sources }`, `type` one of `"person" | "organization" | "company" | "law"`. Prefer short descriptive ids — `ent_*` for entities (`ent_sharma`, `ent_acme_corp`) and `evt_<year>_<slug>` for events; ids must be unique across the whole file.
- `actors` (per event): array of entity ids — drives the cast strip and click-to-filter.
- `tags` (per event): 1–2 short lowercase categories (`"politics"`, `"payment"`, `"meeting"`) — they render as filter pills.
- `gap_before` (per event): normally omit — the renderer auto-marks long silent stretches as hatched bands. Set `{ "label": "…" }` only to annotate a deliberate skip in your own words.
- `confidence`: 0–1, optional. Links below `0.65` render dashed, marking them as inferred — never inflate this. Omitted links-confidence is drawn as stated.
- `sources`: where the event comes from (see Sourcing). Object fields: `label` (display text), `url` (http/https only), `locator` (`"p. 14"`, `"§3"`, `"lead section"`), `source_tier` (see Sourcing), `excerpt` (verbatim, ≤ ~30 words), `archive_url` (Wayback/Perma mirror), `is_pull_quote` (true renders the excerpt as a callout on the card face — use sparingly). Plain strings work as shorthand.
- `counter_sources`: same shape as `sources` — material that contradicts or complicates the event. When present, the expanded card shows a Claim vs Counter-claim split. Omit it when none was found this session — absence means "not found", not "does not exist".
- `status`: optional epistemic flag, rendered as a greyscale badge and card framing. One of `"proven"` (overwhelmingly documented), `"corroborated"` (multiple independent sources agree), `"inferred"` (a conclusion drawn from circumstantial evidence), `"alleged"` (the event itself is a claim or accusation), `"disputed"` (sources conflict — pair with `counter_sources`). Omit when no flag is needed; never use it to hype.
- `meta`: `last_verified`, `methodology`, `extraction_notes`, `alternative_hypotheses[]` — rendered in the About panel. `alternative_hypotheses` is where you record rival readings of the same record.
- `links.from` / `links.to` must reference existing event ids; direction is **cause → effect**.
- Events render in array order. Sort before writing; for ties, order cause before effect.

## Quality bar

- **Small inputs**: with fewer than 5 events, still render, but say so and don't pad with filler or weak links.
- **Large inputs**: for long material, extract the spine first (see below), then offer to expand specific periods or threads in follow-up passes rather than dumping everything in one timeline.
- **Language**: write titles and descriptions in the language of the user's request/material; keep ids and JSON keys in English.

- 5–40 events is the sweet spot. For long inputs, extract the spine and offer to expand it.
- Keep titles under ~60 characters, descriptions under ~350.
- **Event granularity**: an inline consequence earns its own event card when a later event reacts to it — "the crash scared off investors" becomes a card if the raise or the safety hire flows from that fear. Pure color and commentary stay in the description of their parent event. Roughly one card per distinct outcome or decision.
- Never invent facts, dates, or links. `null` dates and omitted links are fine; fabricated ones are not.
- When sources conflict, prefer the better-attested date, set `"status": "disputed"`, and put the opposing material in `counter_sources` — the card renders the split. Note residual uncertainty in the description.
- **Gaps are findings.** When the record goes quiet between two events, leave the gap — the renderer auto-marks long silences as a hatched "no recorded events" band. Never pad a silent stretch with invented filler; if you researched the window and found nothing, say so in `meta.extraction_notes`.
- **Verbatim means verbatim.** Quoted material (`excerpt`) must be copied exactly from a source you fetched this session; cut it, never rewrite it. Paraphrase belongs in `description`, quotes belong in `excerpt`.

## Sourcing

Every event should carry its provenance when one exists — the card shows `sources` at a glance and reveals all of them when expanded.

- **From the user's material**: cite the document itself — "User-provided notes", the file name, or a citation already embedded in the text. `source_tier: "user_material"`.
- **From web research you actually performed**: cite the exact page with its URL and copy a ≤30-word `excerpt` **verbatim** — if you did not fetch the page in this session, do not write an excerpt for it. `source_tier` values: `primary_record` (court or government records), `official_report` (audit/commission/CAG-style), `sworn_testimony`, `journalism`, `reference` (encyclopedias and similar), `unverified_social`.
- **From your own model knowledge only**: never fabricate URLs. Either omit `sources`, or use a label-only entry, clearly marked — e.g. `"Unverified — Wikipedia: Battle of Stalingrad"`. Only attach a URL that you fetched or verified during this session.
- Add a `locator` (`"p. 14"`, `"§3"`, `"lead section"`) whenever the source is longer than a page; add `archive_url` when a Wayback or Perma.cc mirror exists.
- Never invent a source for an event that has none, and never present an invented excerpt — the excerpt is the part that outlives link rot.

## Iterating

When the user asks for changes ("drop event 3", "that arrow is wrong", "add more detail on e5"), edit the JSON inside the delivered HTML — it lives in the `window.__TIMELINE_DATA__ = { ... };` block — or regenerate for larger revisions. Don't touch the renderer code; only the data block.

## Optional: portable exports

Offer these when the user needs something beyond the HTML file:

- **Mermaid flowchart** (for READMEs and markdown tools — edge labels carry the causality):

  ```mermaid
  flowchart TD
    e1["133 BCE · Tiberius Gracchus tribune"] -->|sparked backlash| e2["121 BCE · Gaius Gracchus killed"]
  ```

  Note: mermaid views do not guarantee vertical chronological order.

- **Mermaid timeline** (pure chronology, no causes): a `timeline` block with `title` and `section`s, one entry per event.
