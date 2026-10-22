# Changelog

## 2.0.4 - 2026-10-23

### Fixed

- Switching scale mode while a card was expanded no longer distorts the layout. The upper bank used to keep the extra height that the expanded card had temporarily contributed to the lane math; layout now always measures resting card heights, and the open card stays a clean overlay.

## 2.0.3 - 2026-10-22

### Changed

- The top bar now uses an Apple-style glass material instead of the old translucent strip: a lighter tint (30% opacity, 34% in dark mode), a moderate 12px backdrop blur, a glass-tuned hairline border, a 1px inner top highlight, and a soft drop shadow. No color saturation boost keeps cards underneath their true colors.

## 2.0.2 - 2026-10-22

### Internal

- Validation and CI hardening from the community-feedback merge: the catalog check reports a proper exit code, validators now check date ranges and causal-link ordering, and CI requires a version bump whenever skill files change in a pull request.

## 2.0.1 - 2026-10-22

### Fixed

- Causal-chain hop badges no longer share the date row. Focusing a card no longer shrinks a long date into two lines or changes the card height; the badge sits above the date with a descriptive tooltip and is hidden at compact/overview zoom and in print.
- Expanded cards near the bottom of the stage no longer have their lower content clipped. The stage grows just enough to keep the whole open card readable, and shrinks again when it closes.

## 2.0.0 - 2026-10-22

The viewer becomes a reading instrument: real time scales, density-aware zoom, eras, a minimap, and portable exports.

### Added

- Three scale modes: **time** (proportional to elapsed time, with a minimum card clearance), **hybrid** (default; true intervals inside clusters with long silences compressed into labelled `// … //` breaks), and **ordinal** (equal columns, with era and gap overlays omitted). The choice persists in `localStorage`. Gap labels drop out at overview zoom and fall back to the duration when a manual label will not fit; the full text stays in the tooltip.
- Real 25–500% zoom with layout reflow at 1.25× steps, Ctrl/⌘ + wheel, trackpad pinch, and viewport-center anchoring. No CSS-transform scaling; text never drops below 11px.
- Three levels of detail: 132px overview cards, 210px compact cards, 300px full cards (252px on mobile).
- Optional `eras[]` in the timeline schema: full-height period tints with top labels, plus era bands in the minimap. Rendered in time and hybrid modes.
- Fixed minimap with a draggable, keyboard-operable thumb (`←` / `→`, `Home` / `End`), era and gap bands, and event ticks.
- Header exports: stripped JSON, CSV (UTF-8 BOM, CRLF, quote doubling, formula guard), Mermaid flowchart, and TimelineJS 3 JSON.
- Time-ladder axis ticks for dense clusters, event-date labels where space permits, gap ribbons, and real link labels with collision avoidance.
- Header and filter layout for narrow screens, including a compact mobile control bar.

### Changed

- The layout engine uses a minimum stride of `cardWidth / 2 + 8` so adjacent cards always clear one another; each side of the axis is now a single bank.
- Cards wider than ~300px collapse to info-dense compact/overview variants via CSS rather than shrinking type.
- Card expansion is an overlay: it never moves other cards. Below 85% zoom the first click zooms to 100% and centers the event; the second click expands.
- Dossier and print restore content hidden by the density rules. Print hides the minimap and link labels.
- The validator now checks `eras[]`, HTML feature markers, escaped `<` / U+2028 / U+2029 in injected JSON, and BCE dates sort correctly.

### Fixed

- Initial page load no longer re-centers on a middle event when web fonts settle.
- Mobile header controls and filter rows no longer force horizontal page overflow.
- Overlapping link labels are repositioned or hidden until hover.
- Gap-crossing links are explicitly dashed.

## 1.0.0 — 2026-10-18

Initial public catalog release: single-file causal timeline renderer, greyscale editorial design, dark mode, filters, causal-chain stepping, source ledger, dossier/print, and the World War II demo.
