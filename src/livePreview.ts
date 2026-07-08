import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder, type Extension } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { editorInfoField, editorLivePreviewField, Keymap } from "obsidian";
import type ReadableDatesPlugin from "./main";

/** Number of characters taken by the surrounding brackets: [[ and ]]. */
const BRACKETS = 2;

class ReadableDateWidget extends WidgetType {
	constructor(
		private readonly plugin: ReadableDatesPlugin,
		private readonly display: string,
		private readonly linktext: string
	) {
		super();
	}

	eq(other: ReadableDateWidget): boolean {
		return other.display === this.display && other.linktext === this.linktext;
	}

	toDOM(view: EditorView): HTMLElement {
		const span = document.createElement("span");
		span.className = "cm-hmd-internal-link cm-underline readable-date";
		span.textContent = this.display;
		span.addEventListener("click", (event) => {
			event.preventDefault();
			const sourcePath =
				view.state.field(editorInfoField).file?.path ?? "";
			void this.plugin.app.workspace.openLinkText(
				this.linktext,
				sourcePath,
				Keymap.isModEvent(event)
			);
		});
		return span;
	}
}

/**
 * Live preview: replace the text of bare internal links ([[2026-07-07]],
 * no alias, no subpath) with the readable date. The raw text is revealed
 * whenever the selection touches the link, mirroring live preview's own
 * bracket behavior.
 */
export function buildLivePreviewExtension(
	plugin: ReadableDatesPlugin
): Extension {
	class ReadableDatesViewPlugin implements PluginValue {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = this.buildDecorations(view);
		}

		update(update: ViewUpdate) {
			if (
				update.docChanged ||
				update.viewportChanged ||
				update.selectionSet ||
				update.transactions.some((tr) => tr.reconfigured)
			) {
				this.decorations = this.buildDecorations(update.view);
			}
		}

		buildDecorations(view: EditorView): DecorationSet {
			if (
				!plugin.settings.enableLivePreview ||
				!view.state.field(editorLivePreviewField)
			) {
				return Decoration.none;
			}

			const sourcePath =
				view.state.field(editorInfoField).file?.path ?? "";
			const builder = new RangeSetBuilder<Decoration>();

			for (const { from, to } of view.visibleRanges) {
				syntaxTree(view.state).iterate({
					from,
					to,
					enter: (node) => {
						const name = node.type.name;
						// Bare link targets carry hmd-internal-link without
						// formatting/alias variants; aliased targets are
						// tagged link-has-alias and get skipped here.
						if (!name.includes("hmd-internal-link")) return;
						if (name.includes("formatting")) return;
						if (name.includes("alias")) return;

						if (this.selectionTouches(view, node.from, node.to))
							return;

						const linktext = view.state.doc.sliceString(
							node.from,
							node.to
						);
						const display = plugin.getDisplayText(
							linktext,
							sourcePath
						);
						if (display === null) return;

						builder.add(
							node.from,
							node.to,
							Decoration.replace({
								widget: new ReadableDateWidget(
									plugin,
									display,
									linktext
								),
							})
						);
					},
				});
			}

			return builder.finish();
		}

		selectionTouches(view: EditorView, from: number, to: number): boolean {
			for (const range of view.state.selection.ranges) {
				if (
					range.from <= to + BRACKETS &&
					range.to >= from - BRACKETS
				) {
					return true;
				}
			}
			return false;
		}
	}

	return ViewPlugin.fromClass(ReadableDatesViewPlugin, {
		decorations: (value) => value.decorations,
	});
}
