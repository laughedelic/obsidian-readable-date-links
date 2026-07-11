import { getLinkpath, Plugin } from "obsidian";
import { momentFn } from "./obsidianMoment";
import {
	DEFAULT_SETTINGS,
	formatBasename,
	isInFolderScope,
	ReadableDateLinksSettings,
} from "./readable";
import { buildLivePreviewExtension } from "./livePreview";
import { buildPostProcessor } from "./readingView";
import { ReadableDateLinksSettingTab } from "./settings";

export default class ReadableDateLinksPlugin extends Plugin {
	settings: ReadableDateLinksSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ReadableDateLinksSettingTab(this.app, this));
		this.registerMarkdownPostProcessor(buildPostProcessor(this));
		this.registerEditorExtension(buildLivePreviewExtension(this));
	}

	/**
	 * Display text for a link, or null when the link should be left alone.
	 * `linktext` must be the bare link target (no alias, no subpath).
	 */
	getDisplayText(linktext: string, sourcePath: string): string | null {
		if (getLinkpath(linktext) !== linktext) return null; // has a subpath

		const file = this.app.metadataCache.getFirstLinkpathDest(
			linktext,
			sourcePath
		);
		if (file) {
			if (!isInFolderScope(file.path, this.settings.folder)) return null;
			return formatBasename(file.basename, this.settings, momentFn);
		}
		// Unresolved link (e.g. a future daily note): the folder it would land
		// in is unknown, so only transform when the scope is vault-wide.
		if (this.settings.folder !== "") return null;
		return formatBasename(linktext, this.settings, momentFn);
	}

	async loadSettings() {
		const data = (await this.loadData()) as
			| Partial<ReadableDateLinksSettings>
			| null;
		this.settings = { ...DEFAULT_SETTINGS, ...data };
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Nudge open editors so live-preview decorations rebuild.
		this.app.workspace.updateOptions();
	}
}
