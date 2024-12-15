import vscode from "vscode";
import { updateSelections } from "../utils/updateSelections";

export const shrinkSelection = (insetStart = 1, insetEnd = 1) => {
	updateSelections((selection, editor) => {
		const start = editor.document.offsetAt(selection.start);
		const end = editor.document.offsetAt(selection.end);

		if (start === end) return null;

		if (start + insetStart > end - insetEnd) return null;

		return new vscode.Selection(
			editor.document.positionAt(start + insetStart),
			editor.document.positionAt(end - insetEnd),
		);
	});
};
