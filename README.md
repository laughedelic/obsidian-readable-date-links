# Readable Date Links Obsidian Plugin

[![CI](https://github.com/laughedelic/obsidian-readable-date-links/actions/workflows/ci.yml/badge.svg)](https://github.com/laughedelic/obsidian-readable-date-links/actions/workflows/ci.yml)
[![CodeQL](https://github.com/laughedelic/obsidian-readable-date-links/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/laughedelic/obsidian-readable-date-links/actions/workflows/github-code-scanning/codeql)
[![GitHub Advanced Security](https://github.com/laughedelic/obsidian-readable-date-links/actions/workflows/agents/github-advanced-security/badge.svg)](https://github.com/laughedelic/obsidian-readable-date-links/actions/workflows/agents/github-advanced-security)

Keep your daily-note filenames as plain `YYYY-MM-DD` (sortable, unambiguous, easy to link) while **displaying** links to them as human-readable dates:

> Discussed on **2026-07-07**

Becomes:

> Discussed on **Tuesday, Jul 7, 2026**

Strictly cosmetic. The plugin never renames files, never writes frontmatter or aliases, never changes note content. Turn it off and nothing has changed.

## Demo

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/23dd4f22-fb5b-43d0-be9f-c817729c8165">
  <img src="https://github.com/user-attachments/assets/dee469eb-49a3-407b-85b4-f0b2ca2c4885" alt="Typing a daily-note link that renders as a readable date" width="615">
</picture>

## What it does

- **Live preview**: bare date links (`[[2026-07-07]]`) render as the formatted date while you edit. Moving the cursor into the link reveals the raw text, just like live preview does with brackets. Clicking the formatted date opens the note as usual.
- **Reading view**: the same links render as the formatted date.

Links with an explicit alias (`[[2026-07-07|that meeting]]`) and links with subpaths (`[[2026-07-07#Notes]]`) are never touched: you already chose their display text.

## Settings

- **Filename pattern**: the [moment format](https://momentjs.com/docs/#/displaying/format/) your daily-note names follow (default `YYYY-MM-DD`). Parsing is strict: `2026-02-30` or `2026-7-7` won't match.
- **Display format**: how matching links are rendered (default `dddd, MMM D, YYYY`), with a live preview of today's note in the settings tab.
- **Relative labels**: optionally show *Today*, *Yesterday*, *Tomorrow* for the adjacent days.
- **Folder**: limit the transformation to one folder (subfolders included), e.g. your daily-notes folder. Empty means the whole vault.
- **Per-context toggles**: live preview and reading view can be enabled independently.

## Scope and limitations

File explorer, tab headers, quick switcher, search results, graph view and the inline title still show the raw filename. Reaching those contexts requires monkey-patching Obsidian's internal views, a private-API hack that breaks across updates and is the main source of risk flags in plugins that do it. This plugin only uses public APIs (a CodeMirror editor extension and a Markdown post-processor), so those contexts are out of scope by design.

Link text is where readability matters most: that's where dates appear mid-sentence in your prose. If Obsidian ships a public display-name API for the other contexts, this plugin will be able to support it as well.

## Related plugins

- [Human Readable Dates](https://github.com/tbergeron/obsidian-human-readable-dates) displays dates as *relative* phrases ("5 mins ago", "In 3 days", "Last week") that keep shifting as time passes, in live preview only. 
  - This plugin instead renders a fixed, fully configurable date and works in reading view as well as live preview. 
  - The overlap is the optional relative labels, which are deliberately limited to *Today* / *Yesterday* / *Tomorrow*: anything further away stays an exact date instead of becoming a vague "2 weeks ago".
- [Relative Dates](https://github.com/munckenh/obsidian-relative-dates) is in the same relative-phrases family as Human Readable Dates for `@`-date format, with color coding.
- [Natural Language Dates](https://github.com/amato21/nldates-revived) is complementary rather than overlapping: it helps you *insert* date links by typing things like `@today`. 
  - This plugin makes those links pleasant to read afterwards.

## Manual installation

It is recommended to install this plugin via the Community Plugins browser, but you can also install it manually:

Download `main.js` and `manifest.json` from the latest release into `<vault>/.obsidian/plugins/readable-date-links/`, then enable it in **Settings → Community plugins**. Or install via [BRAT](https://github.com/TfTHacker/obsidian42-brat).

## Development

```bash
npm install
npm test        # unit tests for the date logic
npm run test:e2e # end-to-end tests in a real Obsidian instance, desktop and mobile-emulated
npm run build    # typecheck + production build
```

The date/pattern logic lives in [src/readable.ts](src/readable.ts), an Obsidian-free module with unit tests. The two UI integrations are thin wrappers around it.

End-to-end tests ([test/specs](test/specs)) run via [wdio-obsidian-service](https://github.com/jesse-r-s-hines/wdio-obsidian-service) against a real, freshly-downloaded Obsidian instance — no mocking. Each spec runs twice: once as normal desktop Obsidian, once with `app.emulateMobile(true)` on, so mobile-UI regressions are caught without needing a phone or emulator. Both run in CI on every push. This doesn't cover the real mobile app's Capacitor runtime (only public CM6/markdown-postprocessor APIs are used here, so the risk is low), but if that ever matters, `wdio-obsidian-service` also supports testing the real Obsidian Android app via Appium — see its README.

## License

[MIT](LICENSE)
