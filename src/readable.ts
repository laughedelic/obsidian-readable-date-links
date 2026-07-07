/**
 * Pure date-display logic. Obsidian-free: the moment instance is injected
 * (Obsidian ships one; tests use the moment package directly).
 */

export interface ReadableDatesSettings {
	/** Moment format the daily-note basenames follow, e.g. YYYY-MM-DD. */
	filenamePattern: string;
	/** Moment format used for display, e.g. dddd, MMM D, YYYY. */
	displayFormat: string;
	/** Show "Today" / "Yesterday" / "Tomorrow" instead of the full date. */
	relativeLabels: boolean;
	/** Folder scope (with subfolders). Empty string = whole vault. */
	folder: string;
	enableLivePreview: boolean;
	enableReadingView: boolean;
}

export const DEFAULT_SETTINGS: ReadableDatesSettings = {
	filenamePattern: "YYYY-MM-DD",
	displayFormat: "dddd, MMM D, YYYY",
	relativeLabels: false,
	folder: "",
	enableLivePreview: true,
	enableReadingView: true,
};

/** Minimal structural slice of a moment object, so this module stays dependency-free. */
export interface MomentLike {
	isValid(): boolean;
	format(format: string): string;
	startOf(unit: "day"): MomentLike;
	diff(other: MomentLike, unit: "days"): number;
}

export type MomentFn = (input?: string, format?: string, strict?: boolean) => MomentLike;

const RELATIVE_LABELS: Record<number, string> = {
	[-1]: "Yesterday",
	0: "Today",
	1: "Tomorrow",
};

/**
 * Returns the human-readable display text for a basename, or null when the
 * basename does not strictly match the configured filename pattern.
 *
 * `now` is injectable for tests; defaults to the current moment.
 */
export function formatBasename(
	basename: string,
	settings: ReadableDatesSettings,
	moment: MomentFn,
	now?: MomentLike
): string | null {
	const parsed = moment(basename, settings.filenamePattern, true);
	if (!parsed.isValid()) return null;

	if (settings.relativeLabels) {
		const today = (now ?? moment()).startOf("day");
		const dayDiff = parsed.startOf("day").diff(today, "days");
		const label = RELATIVE_LABELS[dayDiff];
		if (label !== undefined) return label;
	}

	return parsed.format(settings.displayFormat);
}

/**
 * Whether a vault path falls inside the configured folder scope
 * (subfolders included). Empty folder means the whole vault.
 */
export function isInFolderScope(filePath: string, folder: string): boolean {
	const scope = folder.replace(/^\/+|\/+$/g, "");
	if (scope === "") return true;
	return filePath.startsWith(scope + "/");
}
