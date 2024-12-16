import * as vscode from "vscode";
import "./commands";
import "./ui/editorStyles";
import { onInput } from "./inputHandler";
import { destroy, get, set } from "./store";
import { initCapsLockRemapper } from "./utils/capsLockRemapper";

export function activate(context: vscode.ExtensionContext) {
	console.log("[chords] Extension activated");

	set("context", context);

	context.subscriptions.push(
		vscode.commands.registerCommand("type", async (args) => {
			if (!vscode.window.activeTextEditor || get("mode") === "insert") {
				return vscode.commands.executeCommand("default:type", args);
			}

			onInput(args.text);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("chords.input", (char) => {
			onInput(char);
		}),
	);

	initCapsLockRemapper();
}

export function deactivate() {
	console.log("[chords] Extension deactivated");
	destroy();
}
