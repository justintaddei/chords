import vscode from "vscode";
import { nearestMatch } from "../matchers/nearestMatch";
import { showWarning } from "../ui/status-bar";
import { updateSelections } from "../utils/updateSelections";

export const cursorTo = (
	string: string,
	direction: "left" | "right",
	select = false,
): void => {
	const matchFound = updateSelections((selection) => {
		const match = nearestMatch(string, selection.active, direction, select);

		if (!match) return null;

		return select
			? new vscode.Selection(selection.anchor, match)
			: new vscode.Selection(match, match);
	});

	if (matchFound) showWarning("(no match found)");
};
