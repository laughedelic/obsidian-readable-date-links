import { MarkdownPostProcessor } from "obsidian";
import type ReadableDateLinksPlugin from "./main";

/**
 * Reading view: rewrite the text of internal links whose target basename
 * matches the date pattern. Only touches links rendered without an alias
 * (text identical to the link target) and only via textContent.
 */
export function buildPostProcessor(
	plugin: ReadableDateLinksPlugin
): MarkdownPostProcessor {
	return (el, ctx) => {
		if (!plugin.settings.enableReadingView) return;

		const links = el.querySelectorAll<HTMLAnchorElement>("a.internal-link");
		for (const link of Array.from(links)) {
			const target = link.getAttribute("data-href");
			if (!target || link.textContent !== target) continue;

			const display = plugin.getDisplayText(target, ctx.sourcePath);
			if (display === null) continue;

			link.textContent = display;
		}
	};
}
