# Date Rules

How to normalize, rank, and place dates in Chronology Samajhiye timelines.

## 1. The precision ladder (never climb up)

Day → Month → Year → Approx → Relative → Unknown.

If the source says "March 2020", store `"2020-03"` with `precision: "month"` — do not invent a day. "Sometime in 2020" → `"2020"`, `precision: "year"`. A fabricated exact date is worse than a vague one; the renderer shows `~` for `approx`, so use that flag liberally instead of guessing precision.

## 2. ISO normalization

| Source | `start` | `precision` |
|---|---|---|
| "15 March 2020" | `"2020-03-15"` | `day` |
| "March 2020" | `"2020-03"` | `month` |
| "2020" | `"2020"` | `year` |
| "around 1857" | `"1857"` | `approx` |
| "spring 2022" / "late 2022" | `"2022"` + `date_label: "spring 2022"` | `approx` |
| "44 BC" | `"-0044"` | `year` |
| "3rd century CE" | `null` + `date_label: "3rd century CE"` | `approx` |
| "recently" | `null` + `date_label: "recently"` | `relative` |

Parts of a year (seasons, "early/mid/late", halves) have no ISO form: store the year with `precision: "approx"` **and** set `date_label` to the original wording — the label renders exactly as written, and the ISO year keeps the data sortable. Century and decade references ("the 1990s") do not fit ISO at all — use `start: null` with a `date_label`, and rely on array position to place them.

**Tiebreaker for fuzzy dates:** if the vague wording carries information the reader needs (season, part of year, era flavor), keep it in `date_label`; if it merely approximates a clean unit ("around 1857"), stick to ISO + `approx`.

## 3. Relative expressions

"soon after", "two weeks later", "meanwhile", "after the merger" are anchors, not dates.

1. Find the nearest already-timed event they reference.
2. Derive an approximate date from it and keep `precision` no better than `approx`.
   Example: "two weeks later" following `"2020-03-01"` → `"2020-03"` with `approx`.
   Example: "emerged in late 2022, citing the war" where the war is `"2022-02"` → `"2022"` with `approx` and `date_label: "late 2022"`.
3. If derivation is shaky, keep `start: null` and set `date_label` — e.g. `"soon after the merger"`. The card will show the label; position it in the array right after its anchor.

Never stack relative expressions ("shortly after the aftermath of…") — collapse to the nearest concrete anchor.

## 4. Spans

Multi-year processes get `start` + `end` — e.g. World War II: `"1939-09"` → `"1945-09"`, `precision: "month"`. Cards display ranges (`Sep 1939 – Sep 1945`). Do not split a continuous process into fake sub-events unless the source itself describes distinct phases with their own dates.

## 5. Ordering (array position rules)

The renderer draws the spine in array order — this ordering **is** the chronology.

1. Sort by resolved date.
2. Ties: cause before effect, then by importance.
3. Undated/relative events: place immediately after their anchor event; if no anchor, at the position the narrative implies.
4. Re-check the final array: could any two neighbors plausibly be swapped by a reader? If yes, re-order or adjust.

## 6. What the renderer does with your values

- `date_label` present → shown as-is (date fields are ignored for display).
- `precision: "approx"` → a `~` prefix.
- `"2020-03-15"` → `15 Mar 2020`; `"2020-03"` → `Mar 2020`; `"-0044"` → `44 BCE`; `"-0044-03-15"` → `15 Mar 44 BCE`.
- `end` present → shown as `start – end`.
- `null` with no label → no date line on the card.
