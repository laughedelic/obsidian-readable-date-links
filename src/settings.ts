import { App, PluginSettingTab, Setting } from "obsidian";
import { DEFAULT_SETTINGS, formatBasename } from "./readable";
import { momentFn } from "./obsidianMoment";
import type ReadableDateLinksPlugin from "./main";

export class ReadableDateLinksSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: ReadableDateLinksPlugin
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const preview = (): string => {
			const today = momentFn().format(
				this.plugin.settings.filenamePattern
			);
			return (
				formatBasename(
					today,
					{ ...this.plugin.settings, relativeLabels: false },
					momentFn
				) ?? "⚠️ today's note name does not match the pattern"
			);
		};

		const previewEl = createSpan();

		new Setting(containerEl)
			.setName("Filename pattern")
			.setDesc(
				"Moment format your daily-note names follow. Only names matching it exactly are transformed."
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.filenamePattern)
					.setValue(this.plugin.settings.filenamePattern)
					.onChange(async (value) => {
						this.plugin.settings.filenamePattern =
							value.trim() || DEFAULT_SETTINGS.filenamePattern;
						await this.plugin.saveSettings();
						previewEl.setText(preview());
					})
			);

		new Setting(containerEl)
			.setName("Display format")
			.setDesc("Moment format used to render matching links.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.displayFormat)
					.setValue(this.plugin.settings.displayFormat)
					.onChange(async (value) => {
						this.plugin.settings.displayFormat =
							value.trim() || DEFAULT_SETTINGS.displayFormat;
						await this.plugin.saveSettings();
						previewEl.setText(preview());
					})
			);

		const previewSetting = new Setting(containerEl)
			.setName("Preview")
			.setDesc("How a link to today's note will look.");
		previewEl.setText(preview());
		previewSetting.controlEl.appendChild(previewEl);

		new Setting(containerEl)
			.setName("Relative labels")
			.setDesc(
				'Show "today", "yesterday" and "tomorrow" instead of the full date.'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.relativeLabels)
					.onChange(async (value) => {
						this.plugin.settings.relativeLabels = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Folder")
			.setDesc(
				"Only transform links to notes in this folder (subfolders included). Leave empty for the whole vault."
			)
			.addText((text) =>
				text
					.setPlaceholder("Example: Daily")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Contexts").setHeading();

		new Setting(containerEl)
			.setName("Live preview")
			.setDesc("Transform date links while editing in live preview.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableLivePreview)
					.onChange(async (value) => {
						this.plugin.settings.enableLivePreview = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Reading view")
			.setDesc(
				"Transform date links in reading view. Applies to newly rendered notes."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableReadingView)
					.onChange(async (value) => {
						this.plugin.settings.enableReadingView = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
