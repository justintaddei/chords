import vscode from "vscode";

export const nearestMatch = (
	str: string,
	position: vscode.Position,
	direction: "left" | "right",
	inclusive = false,
) => {
	if (!vscode.window.activeTextEditor) return null;

	const editor = vscode.window.activeTextEditor;
	const startIndex = editor.document.offsetAt(position);
	const text = editor.document.getText();

	let index: number;

	if (direction === "left") index = text.lastIndexOf(str, startIndex - 1);
	else index = text.indexOf(str, startIndex + 1);

	if (index === -1) return null;

	const offset = direction === "left" ? -1 : 1;

	return editor.document.positionAt(index + (inclusive ? offset : 0));
};
