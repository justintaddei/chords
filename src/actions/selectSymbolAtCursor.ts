import vscode from "vscode";
import { updateSelections } from "../utils/updateSelections";

const findSymbol = (
	symbols: vscode.DocumentSymbol[],
	selection: vscode.Selection,
): vscode.DocumentSymbol | undefined => {
	for (const symbol of symbols) {
		if (
			symbol.range.contains(selection.active) &&
			!symbol.range.isEqual(selection)
		) {
			if (symbol.children.length > 0) {
				const deeperSymbol = findSymbol(symbol.children, selection);

				return deeperSymbol ?? symbol;
			}
			return symbol;
		}
	}
};

export const selectSymbolAtCursor = async () => {
	if (!vscode.window.activeTextEditor) return;

	const symbols = (await (() =>
		vscode.commands.executeCommand(
			"vscode.executeDocumentSymbolProvider",
			vscode.window.activeTextEditor?.document.uri,
		))()) as vscode.DocumentSymbol[];

	updateSelections((selection) => {
		const symbol = findSymbol(symbols, selection);

		if (!symbol) return null;

		return new vscode.Selection(symbol.range.start, symbol.range.end);
	});
};
