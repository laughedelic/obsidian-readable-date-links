# Readable Dates Obsidian Plugin

Keep your daily-note filenames as plain `YYYY-MM-DD` (sortable, unambiguous, easy to link) while **displaying** links to them as human-readable dates:

> Discussed on **2026-07-07**

Becomes:

> Discussed on **Tuesday, Jul 7, 2026**

Strictly cosmetic. The plugin never renames files, never writes frontmatter or aliases, never changes note content. Turn it off and nothing has changed.

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

## Manual installation

It is recommended to install this plugin via the Community Plugins browser, but you can also install it manually:

Download `main.js` and `manifest.json` from the latest release into `<vault>/.obsidian/plugins/readable-dates/`, then enable it in **Settings → Community plugins**. Or install via [BRAT](https://github.com/TfTHacker/obsidian42-brat).

## Development

```bash
npm install
npm test       # unit tests for the date logic
npm run build  # typecheck + production build
```

The date/pattern logic lives in [src/readable.ts](src/readable.ts), an Obsidian-free module with unit tests. The two UI integrations are thin wrappers around it.

## License

[MIT](LICENSE)
