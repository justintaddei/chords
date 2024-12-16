import vscode from "vscode";
import { get, set } from "../store";

export const discardSelections = () => {
	if (!vscode.window.activeTextEditor) return;

	const selectionHistory = get("selectionHistory");

	selectionHistory.pop();

	set("selectionHistory", selectionHistory);
};
