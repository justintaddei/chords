import { spawn } from "node:child_process";
import path from "node:path";
import * as vscode from "vscode";
import { config } from "../config";
import { get, set } from "../store";

let kill: null | (() => void) = null;

export const killCapsLockRemapper = () => kill?.();

export const remapCapsLock = (context: vscode.ExtensionContext) => {
	killCapsLockRemapper();

	const capsLockRemapper = spawn("python3", [
		path.join(context.extensionPath, "caps_lock_utils", "remap.py"),
	]);

	capsLockRemapper.stderr.on("data", (data) => {
		console.error("[chords]", data.toString());
	});

	capsLockRemapper.on("exit", (code) => {
		if (!code) return;

		vscode.window.showErrorMessage(
			`Caps Lock Remapper exited with code ${code}`,
		);
	});

	kill = () => {
		console.log("[chords] stopping CapsLock remapper");
		capsLockRemapper.kill();
		kill = null;
	};
};

export const initCapsLockRemapper = () => {
	killCapsLockRemapper();

	if (process.platform === "win32" && config().get("remapCapsLock")) {
		const context = get("context");

		if (!context) return;

		console.log("[chords] starting CapsLock remapper");

		remapCapsLock(context);
		vscode.commands.executeCommand(
			"setContext",
			"chords.remappedCapsLock",
			true,
		);
	}
};
