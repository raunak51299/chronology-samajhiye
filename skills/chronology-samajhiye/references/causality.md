# Causality Rules

How to decide, label, and score causal links in Chronology Samajhiye timelines.

## 1. Direction

Every link points **cause → effect**: from the earlier event to the later one. Labels read naturally along the arrow: "Recession" —sparked→ "Hiring freeze". If a link seems to point backwards in time, you have probably mis-ordered your events.

## 2. Label vocabulary

Pick the tightest verb phrase, 1–3 words, from this set (avoid inventing new ones):

| Label | Use when |
|---|---|
| `led to` | neutral default; consequence flows naturally |
| `triggered` | near-immediate, direct ignition |
| `caused` | source states it explicitly and strongly |
| `sparked` | ignition of unrest, conflict, or change |
| `enabled` | made something possible (means, permission, technology) |
| `accelerated` | sped up an already ongoing process |
| `prevented` | blocked a specific outcome that still needs an event to describe |
| `weakened` | degraded a system, position, or actor |
| `set stage` | removed obstacles / created the conditions |

Do not use timing-only words ("preceded", "followed by") as labels — that is sequencing, not causation.

## 3. Confidence rubric

| Band | Value | Condition | Renders as |
|---|---|---|---|
| Stated | 0.85–1.0 | Source says it explicitly ("because of", "in response to", "led to") | solid arrow |
| Strong | 0.65–0.84 | Mechanism described or well-established; sequence + plausible mechanism | solid arrow |
| Inferred | 0.45–0.64 | Timeline association only, plausible story | dashed arrow |
| Weak | < 0.45 | Do not create the link | — |

If you use an inferred link, keep the label clean and let the score carry the doubt. Do not editorialize labels ("maybe led to") — the dashed style already communicates it.

## 4. Anti-patterns

- **Post hoc, not propter hoc**: B after A ≠ A caused B. Require stated language or a described mechanism.
- **Transitive spam**: if A→B and B→C, do not also add A→C unless the source states it directly.
- **Hub abuse**: if one event collects more than ~4 links, re-check each — usually half belong to its neighbors instead.
- **Cycles**: the graph must be acyclic. Feedback loops get modeled in their strongest direction, or split into two linked events.
- **Duplicate links**: one link per ordered pair. Merge labels ("led to and accelerated" → `accelerated`).

## 5. Quantity guidance

Roughly one link per 1.5–2 events: for 20 events, aim for 8–14 links. Every link should be defensible in one sentence if the user asks "why is this connected?".

## 6. Visual consequences (so you can predict what the user sees)

- Solid arrow: `confidence ≥ 0.65`.
- Dashed arrow: `confidence 0.45–0.64` (inferred).
- Omitted: below 0.45. A gap in the graph is better than a false connector.
