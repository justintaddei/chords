import vscode from "vscode";
import { get, set } from "../store";

export const saveSelections = () => {
	if (!vscode.window.activeTextEditor) return;

	set(
		"selectionHistory",
		get("selectionHistory").concat(vscode.window.activeTextEditor.selections),
	);
};
