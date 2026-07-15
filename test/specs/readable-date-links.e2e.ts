import { browser, expect } from "@wdio/globals";
import { describe, it, beforeEach } from "mocha";

/**
 * Runs against a real Obsidian instance (see wdio.conf.mts), once as normal
 * desktop and once with Obsidian's mobile UI emulation turned on. Same specs,
 * same assertions: this is what stands in for manual mobile testing.
 */
describe("Readable Date Links", function () {
	describe("live preview", function () {
		beforeEach(async function () {
			await browser.executeObsidian(async ({ app }) => {
				const leaf = app.workspace.getLeaf(false);
				await leaf.setViewState({
					type: "markdown",
					state: { file: "Notes.md", mode: "source", source: false },
				});
			});
		});

		it("renders a bare date link as a readable date", async function () {
			const widget = browser.$(".readable-date-link");
			await expect(widget).toHaveText("Tuesday, Jul 7, 2026");
		});

		it("leaves an aliased link untouched", async function () {
			const alias = browser.$(".cm-link-alias");
			await expect(alias).toHaveText("that meeting");
		});
	});

	describe("reading view", function () {
		beforeEach(async function () {
			await browser.executeObsidian(async ({ app }) => {
				const leaf = app.workspace.getLeaf(false);
				await leaf.setViewState({
					type: "markdown",
					state: { file: "Notes.md", mode: "preview" },
				});
			});
		});

		it("renders a bare date link as a readable date", async function () {
			const link = browser.$$(".markdown-preview-view a.internal-link")[0];
			await expect(link).toHaveText("Tuesday, Jul 7, 2026");
		});

		it("leaves an aliased link untouched", async function () {
			const alias = browser.$$(".markdown-preview-view a.internal-link")[1];
			await expect(alias).toHaveText("that meeting");
		});
	});
});
