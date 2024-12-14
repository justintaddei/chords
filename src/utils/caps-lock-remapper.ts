import { spawn } from "node:child_process";
import path from "node:path";
import * as vscode from "vscode";

export const remapCapsLock = (context: vscode.ExtensionContext) => {
	const capsLockRemapper = spawn("python3", [
		path.join(context.extensionPath, "caps_lock_utils", "remap.py"),
	]);

	capsLockRemapper.stderr.on("data", (data) => {
		console.error(data.toString());
	});

	capsLockRemapper.on("exit", (code) => {
		if (!code) return;

		vscode.window.showErrorMessage(
			`Caps Lock Remapper exited with code ${code}`,
		);
	});

	return () => capsLockRemapper.kill();
};
