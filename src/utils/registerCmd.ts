import vscode from "vscode";
import { disposable } from "./vscodeSubscriptionManager";

// biome-ignore lint/suspicious/noExplicitAny: any is the appropriate type
export const registerCmd = (cmd: string, callback: (...args: any[]) => any) => {
	disposable(vscode.commands.registerCommand(cmd, callback));
};
