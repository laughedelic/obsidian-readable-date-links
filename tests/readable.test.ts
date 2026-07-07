import { describe, expect, it } from "vitest";
import moment from "moment";
import {
	DEFAULT_SETTINGS,
	formatBasename,
	isInFolderScope,
	MomentFn,
	ReadableDatesSettings,
} from "../src/readable";

const m = moment as unknown as MomentFn;

const settings = (
	overrides: Partial<ReadableDatesSettings> = {}
): ReadableDatesSettings => ({ ...DEFAULT_SETTINGS, ...overrides });

describe("formatBasename", () => {
	it("formats a matching basename", () => {
		expect(formatBasename("2026-07-07", settings(), m)).toBe(
			"Tuesday, Jul 7, 2026"
		);
	});

	it("respects a custom display format", () => {
		expect(
			formatBasename(
				"2026-07-07",
				settings({ displayFormat: "MMM D" }),
				m
			)
		).toBe("Jul 7");
	});

	it("respects a custom filename pattern", () => {
		const s = settings({ filenamePattern: "DD.MM.YYYY" });
		expect(formatBasename("07.07.2026", s, m)).toBe(
			"Tuesday, Jul 7, 2026"
		);
		expect(formatBasename("2026-07-07", s, m)).toBeNull();
	});

	it("rejects non-matching names", () => {
		expect(formatBasename("Meeting notes", settings(), m)).toBeNull();
		expect(formatBasename("2026-07", settings(), m)).toBeNull();
		expect(formatBasename("2026-07-07 extra", settings(), m)).toBeNull();
		expect(formatBasename("", settings(), m)).toBeNull();
	});

	it("rejects invalid calendar dates (strict parsing)", () => {
		expect(formatBasename("2026-02-30", settings(), m)).toBeNull();
		expect(formatBasename("2026-13-01", settings(), m)).toBeNull();
		expect(formatBasename("2026-00-10", settings(), m)).toBeNull();
	});

	it("rejects lenient near-matches", () => {
		// Strict mode: single-digit segments don't match YYYY-MM-DD.
		expect(formatBasename("2026-7-7", settings(), m)).toBeNull();
	});

	describe("relative labels", () => {
		const s = settings({ relativeLabels: true });
		const now = () => m("2026-07-07", "YYYY-MM-DD", true);

		it("labels today, yesterday and tomorrow", () => {
			expect(formatBasename("2026-07-07", s, m, now())).toBe("Today");
			expect(formatBasename("2026-07-06", s, m, now())).toBe(
				"Yesterday"
			);
			expect(formatBasename("2026-07-08", s, m, now())).toBe("Tomorrow");
		});

		it("falls back to the full date beyond one day", () => {
			expect(formatBasename("2026-07-05", s, m, now())).toBe(
				"Sunday, Jul 5, 2026"
			);
			expect(formatBasename("2026-07-09", s, m, now())).toBe(
				"Thursday, Jul 9, 2026"
			);
		});

		it("labels across month and year boundaries", () => {
			const nye = m("2026-01-01", "YYYY-MM-DD", true);
			expect(formatBasename("2025-12-31", s, m, nye)).toBe("Yesterday");
		});

		it("compares calendar days, not 24h windows (late-night now)", () => {
			const lateNight = m(
				"2026-07-07 23:59",
				"YYYY-MM-DD HH:mm",
				true
			);
			expect(formatBasename("2026-07-08", s, m, lateNight)).toBe(
				"Tomorrow"
			);
			expect(formatBasename("2026-07-06", s, m, lateNight)).toBe(
				"Yesterday"
			);
		});

		it("does not label when the toggle is off", () => {
			expect(
				formatBasename("2026-07-07", settings(), m, now())
			).toBe("Tuesday, Jul 7, 2026");
		});
	});
});

describe("isInFolderScope", () => {
	it("matches everything when the folder is empty", () => {
		expect(isInFolderScope("anywhere/note.md", "")).toBe(true);
		expect(isInFolderScope("note.md", "")).toBe(true);
	});

	it("matches files in the folder and its subfolders", () => {
		expect(isInFolderScope("Daily/2026-07-07.md", "Daily")).toBe(true);
		expect(isInFolderScope("Daily/2026/2026-07-07.md", "Daily")).toBe(
			true
		);
	});

	it("rejects files outside the folder", () => {
		expect(isInFolderScope("Weekly/2026-07-07.md", "Daily")).toBe(false);
		expect(isInFolderScope("2026-07-07.md", "Daily")).toBe(false);
		// Sibling folder sharing the prefix must not match.
		expect(isInFolderScope("DailyArchive/2026-07-07.md", "Daily")).toBe(
			false
		);
	});

	it("normalizes stray slashes in the configured folder", () => {
		expect(isInFolderScope("Daily/2026-07-07.md", "/Daily/")).toBe(true);
	});
});
