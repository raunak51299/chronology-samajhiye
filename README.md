# Chronology Samajhiye

> *Chronology samajhiye* — turn messy text into a rendered causal timeline.

An Agent Skill that turns any body of events — notes, articles, incident reports, transcripts, life stories — into an **interactive causal timeline**: a chronological spine of event cards connected by labeled causal arrows ("what led to what"), delivered as a single self-contained HTML file.

- No API keys, no backend, no dependencies. **The agent itself is the LLM.**
- Output is one HTML file that works offline — open it anywhere, forever.
- Greyscale, editorial design. Hover any event to light up its direct causal links. Light/dark theme built in.

## See it

Open `skills/chronology-samajhiye/template.html` in a browser — it ships with the Fall of the Roman Republic as a live demo.

## Install

**OpenCode (project)** — copy the skill folder (the one containing `SKILL.md`) to:

    your-project/.opencode/skills/chronology-samajhiye/

**OpenCode (global)** — same folder copied to `~/.config/opencode/skills/chronology-samajhiye/`.

**Claude Code / other SKILL.md-compatible agents** — copy to `~/.claude/skills/chronology-samajhiye/` (or `.agents/skills/`).

**HTTP catalog** — add to `opencode.json(c)`:

```jsonc
{ "skills": ["https://<user>.github.io/chronology-samajhiye/"] }
```

The repo root doubles as the catalog: `index.json` plus the `skills/` tree it points to. The skill's folder name is what OpenCode derives its ID from, so keep it kebab-case and unique (`skills/chronology-samajhiye/SKILL.md` reads as ID `chronology-samajhiye`). Bump `version` in `index.json` whenever skill files change so clients refresh their cache.

## Use

In any session where the skill is installed, just ask:

> "Make a timeline of everything that happened in this incident report: [paste]"
>
> "Chronology of the James Webb Space Telescope, from proposal to first images."

The agent extracts events, dates, and causal links, then writes `<output-dir>/<slug>.html` and offers to open it. Ask for changes in plain language afterwards ("drop event 3", "that arrow is wrong") — the agent edits the data block and regenerates.

## Layout

    index.json                 HTTP catalog manifest
    skills/chronology-samajhiye/   the skill (folder name = skill ID)
      SKILL.md                 workflow + JSON schema
      template.html            self-contained renderer (greyscale, dark mode, causal arrows)
      references/
        date-rules.md          precision ladder, relative-date anchoring, ordering
        causality.md           link vocabulary, confidence rubric, anti-patterns

## License

MIT
