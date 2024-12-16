import vscode from "vscode";

export const nearestMatch = (
	str: string,
	position: vscode.Position,
	direction: "left" | "right",
	inclusive = false,
	acceptUnderCursor = false,
) => {
	if (!vscode.window.activeTextEditor) return null;

	const editor = vscode.window.activeTextEditor;
	const startIndex = editor.document.offsetAt(position);
	const text = editor.document.getText();

	let index: number;

	const initialOffset = acceptUnderCursor ? 0 : 1;

	if (direction === "left")
		index = text.lastIndexOf(str, startIndex - initialOffset);
	else index = text.indexOf(str, startIndex + initialOffset);

	if (index === -1) return null;

	const offset = direction === "left" ? -1 : 1;

	return editor.document.positionAt(index + (inclusive ? offset : 0));
};
