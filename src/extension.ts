// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Chords } from "./Chords";
import { charMap } from "./utils/char-map";

function overrideCommand(
	context: vscode.ExtensionContext,
	command: string,
	callback: (...args: any[]) => any,
) {
	const disposable = vscode.commands.registerCommand(command, async (args) => {
		if (!vscode.window.activeTextEditor) {
			return vscode.commands.executeCommand(`default:${command}`, args);
		}

		callback(args);
	});
	context.subscriptions.push(disposable);
}

let chords: Chords;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("[chords] Extension activated");

	chords = new Chords(context);

	overrideCommand(context, "type", async (args: { text: string }) => {
		if (chords.mode === "insert") {
			return vscode.commands.executeCommand("default:type", args);
		}

		chords.onInput(charMap[args.text]);
	});

	context.subscriptions.push(
		vscode.commands.registerCommand("chords.enter", () => {
			chords.onInput("<enter>");
		}),
		vscode.commands.registerCommand("chords.backspace", () => {
			chords.onInput("<backspace>");
		}),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	chords.destroy();
	console.log("[chords] Extension deactivated");
}
