import vscode from "vscode";
import { cursorTo } from "./cursorTo";
import { shrinkSelection } from "./shrinkSelection";

const isBracketPair = (left: string, right: string) => {
	const pairs = {
		"(": ")",
		"[": "]",
		"{": "}",
		"<": ">",
	};

	return left in pairs && pairs[left as keyof typeof pairs] === right;
};

export const selectEnds = async (
	ends: [string, string],
	direction: "left" | "right",
	inside = false,
) => {
	const [left, right] = ends;

	cursorTo(left, direction);

	if (isBracketPair(left, right))
		await vscode.commands.executeCommand("editor.action.selectToBracket");
	else cursorTo(right, "right", true);

	if (inside) shrinkSelection(left.length, right.length);
};
