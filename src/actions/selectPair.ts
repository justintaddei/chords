import vscode from "vscode";
import { findQuoteRange, quoteRanges } from "../matchers/quotes";
import { updateSelections } from "../utils/updateSelections";
import { cursorTo } from "./cursorTo";
import { discardSelections } from "./discardSelections";
import { restoreSelections } from "./restoreSelections";
import { saveSelections } from "./saveSelections";
import { shrinkSelections } from "./shrinkSelection";

const isBracketPair = (left: string, right: string) => {
	const pairs = {
		"(": ")",
		"[": "]",
		"{": "}",
		"<": ">",
	};

	return left in pairs && pairs[left as keyof typeof pairs] === right;
};

const isQuotePair = (left: string, right: string) =>
	left === right && ['"', "'", "`"].includes(left);

export const selectPair = async (
	ends: [string, string],
	direction: "left" | "right",
	inside = false,
) => {
	const [left, right] = ends;

	saveSelections();

	if (isQuotePair(left, right)) {
		const updated = updateSelections((selection, editor) => {
			const lineText = editor.document.lineAt(selection.active.line).text;
			const ranges = quoteRanges(left, lineText);

			if (!ranges.length) return null;

			const result = findQuoteRange(ranges, selection.active);

			if (!result) return null;

			return new vscode.Selection(
				selection.active.with({ character: result.start }),
				selection.active.with({ character: result.end + 1 }),
			);
		});
		if (!updated) return restoreSelections();
	} else {
		const foundLeft = cursorTo(
			left,
			direction,
			false,
			isQuotePair(left, right),
		);
		if (!foundLeft) return restoreSelections();

		if (isBracketPair(left, right)) {
			await vscode.commands.executeCommand("editor.action.selectToBracket");
		} else {
			const foundRight = cursorTo(right, "right", true);
			if (!foundRight) return restoreSelections();
		}
	}

	if (inside) shrinkSelections(left.length, right.length);

	discardSelections();
};
