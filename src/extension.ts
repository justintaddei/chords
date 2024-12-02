// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CapMotions } from "./CapMotions";
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "capmotions" is now active!');

	const capMotions = new CapMotions(context);

	overrideCommand(context, "type", async (args: { text: string }) => {
		if (capMotions.mode === "insert") {
			return vscode.commands.executeCommand("default:type", args);
		}
		// swap case because capslock is on :)
		const char =
			args.text.toUpperCase() === args.text
				? args.text.toLowerCase()
				: args.text.toUpperCase();

		capMotions.onInput(charMap[char]);
	});

	context.subscriptions.push(
		vscode.commands.registerCommand("capmotions.enter", () => {
			capMotions.onInput("<enter>");
		}),
		vscode.commands.registerCommand("capmotions.backspace", () => {
			capMotions.onInput("<backspace>");
		}),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
