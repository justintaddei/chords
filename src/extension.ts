// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
// import { onInput } from "./input-handler";
// import { get } from "./store";
import "./commands";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("[chords] Extension activated");

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand("type", async (args) => {
	// 		if (!vscode.window.activeTextEditor || get("mode") === "insert") {
	// 			return vscode.commands.executeCommand("default:type", args);
	// 		}

	// 		onInput(args.text);
	// 	}),
	// );

	context.subscriptions.push(
		vscode.commands.registerCommand("chords.input", (char) => {
			// onInput(char);
		}),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("[chords] Extension deactivated");
}
