import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { DEFAULT_SETTINGS, ReadableDateLinksSettings } from "./readable";
import { formatBasename } from "./readable";
import { momentFn } from "./obsidianMoment";
import type ReadableDateLinksPlugin from "./main";

export class ReadableDateLinksSettingTab extends PluginSettingTab {
	private previewEl: HTMLElement | null = null;

	constructor(
		app: App,
		private readonly plugin: ReadableDateLinksPlugin
	) {
		super(app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "Filename pattern",
				desc: "Moment format your daily-note names follow. Only names matching it exactly are transformed.",
				control: {
					type: "text",
					key: "filenamePattern",
					defaultValue: DEFAULT_SETTINGS.filenamePattern,
					placeholder: DEFAULT_SETTINGS.filenamePattern,
				},
			},
			{
				name: "Display format",
				desc: "Moment format used to render matching links.",
				control: {
					type: "text",
					key: "displayFormat",
					defaultValue: DEFAULT_SETTINGS.displayFormat,
					placeholder: DEFAULT_SETTINGS.displayFormat,
				},
			},
			{
				name: "Preview",
				desc: "How a link to today's note will look.",
				searchable: false,
				render: (setting) => {
					this.previewEl = setting.controlEl.createEl("strong", {
						text: this.previewText(),
					});
					return () => {
						this.previewEl = null;
					};
				},
			},
			{
				name: "Relative labels",
				desc: 'Show "today", "yesterday" and "tomorrow" instead of the full date.',
				control: { type: "toggle", key: "relativeLabels" },
			},
			{
				name: "Folder",
				desc: "Only transform links to notes in this folder (subfolders included). Leave empty for the whole vault.",
				control: {
					type: "folder",
					key: "folder",
					placeholder: "Example: Daily",
				},
			},
			{
				type: "group",
				heading: "Contexts",
				items: [
					{
						name: "Live preview",
						desc: "Transform date links while editing in live preview.",
						control: { type: "toggle", key: "enableLivePreview" },
					},
					{
						name: "Reading view",
						desc: "Transform date links in reading view. Applies to newly rendered notes.",
						control: { type: "toggle", key: "enableReadingView" },
					},
				],
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof ReadableDateLinksSettings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (typeof value === "string") value = value.trim();
		// An emptied format field falls back to its default, so the plugin
		// never runs with a blank pattern.
		if (
			(key === "filenamePattern" || key === "displayFormat") &&
			value === ""
		) {
			value = DEFAULT_SETTINGS[key];
		}
		const settings = this.plugin.settings as unknown as Record<
			string,
			unknown
		>;
		settings[key] = value;
		await this.plugin.saveSettings();
		this.previewEl?.setText(this.previewText());
	}

	private previewText(): string {
		const today = momentFn().format(this.plugin.settings.filenamePattern);
		return (
			formatBasename(
				today,
				{ ...this.plugin.settings, relativeLabels: false },
				momentFn
			) ?? "⚠️ today's note name does not match the pattern"
		);
	}
}
