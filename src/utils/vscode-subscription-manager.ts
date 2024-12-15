import type vscode from "vscode";
import { get, subscribe } from "../store";

let buffer: vscode.Disposable[] = [];

subscribe(["context"], ({ context }) => {
	if (context) {
		context.subscriptions.push(...buffer);
		buffer = [];
	}
});

export const disposable = <T extends vscode.Disposable>(obj: T): T => {
	const context = get("context");

	if (context) context.subscriptions.push(obj);
	else buffer.push(obj);

	return obj;
};
