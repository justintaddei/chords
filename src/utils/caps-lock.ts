import { spawn } from "node:child_process";
import path from "node:path";
import type * as vscode from "vscode";

export const subscribeToCapsLock = (
	context: vscode.ExtensionContext,
	callback: (status: boolean) => void,
) => {
	console.log("Subscribing to caps lock status");
	const capsLockWatcher = spawn("python3", [
		path.join(context.extensionPath, "caps_lock_utils", "watch.py"),
	]);
	capsLockWatcher.stdout.setEncoding("utf-8");
	capsLockWatcher.stderr.setEncoding("utf-8");

	capsLockWatcher.stdout.on("data", (data) => {
		callback(Boolean(+data.trim()));
	});

	capsLockWatcher.on("exit", (code) => {
		console.log("capslock_watcher exited with code :>>", code);
	});

	// todo
	return capsLockWatcher.kill;
};

export const turnOffCapsLock = (context: vscode.ExtensionContext) => {
	return new Promise((resolve) => {
		const capsLockMonitor = spawn("python3", [
			path.join(context.extensionPath, "caps_lock_utils", "set_off.py"),
		]);
		capsLockMonitor.on("close", () => {
			resolve(true);
		});
	});
};
