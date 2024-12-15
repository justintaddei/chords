import vscode from "vscode";
import { type Chord, constructChord, getChord, isValid } from "./chord";
import { config } from "./config";
import { record } from "./recorder";
import { get, set } from "./store";
import type { Mode } from "./types";
import { setMessage, showWarning } from "./ui/status-bar";

export type ChordDescriptor = {
	chord: string[];
	mode: Mode;
	capture: null | string;
};

const saveLastChord = () => {
	set("lastChord", {
		chord: get("chord"),
		mode: get("mode"),
		capture: get("lastChord").capture,
	});
};

export const waitingForCapture = () => get("onCapture").length > 0;

export const clearCapture = (fulfilled = false) => {
	vscode.commands.executeCommand("setContext", "chords.capture", false);
	if (!fulfilled)
		for (const cb of get("onCapture")) {
			cb("", true);
		}

	set("onCapture", []);
	set("lastChord", { chord: [], mode: get("lastChord").mode, capture: null });
	set("chord", []);
};

export const applyCapture = (char: string) => {
	set("lastChord", {
		chord: get("lastChord").chord,
		mode: get("lastChord").mode,
		capture: char,
	});

	for (const cb of get("onCapture")) {
		cb(char, false);
	}

	record(true);
	clearCapture(true);
};

export const awaitCapture = (cb: (char: string) => void) => {
	return new Promise<void>((resolve, reject) => {
		set(
			"onCapture",
			get("onCapture").concat(async (c, canceled) => {
				if (canceled) return reject(canceled);
				await Promise.resolve(cb(c));
				resolve();
			}),
		);
		setMessage("(waiting for input)");
		vscode.commands.executeCommand("setContext", "chords.capture", true);
	});
};

export const onInput = async (char: string) => {
	if (get("mode") === "insert") return;

	if (char === config.get("leader")) return set("mode", "leader");

	set("chord", get("chord").concat(char));

	if (waitingForCapture()) {
		applyCapture(char);
		return;
	}

	if (isValid()) {
		console.log(
			`[chords] No valid chord '${get("chord")}' for mode '${get("mode")}'`,
		);
		showWarning("(invalid chord)");
		set("chord", []);
		return;
	}

	const [count, motion] = constructChord();

	for (let i = 0; i < count; i++) {
		// the mode can be updated by commands (e.g. "2i"),
		// so we need to check this on each iteration.
		if (get("mode") === "insert") {
			showWarning("(insert cannot be repeated)");
			return;
		}

		const command = getChord(motion);

		const execCord = async (c: Chord) => {
			if (Array.isArray(c)) {
				for (const _c of c) await execCord(_c);
				return;
			}

			set("chord", []);
			if (get("mode") === "leader") set("mode", "normal");

			if (typeof c === "string") return await vscode.commands.executeCommand(c);

			await vscode.commands.executeCommand(c.cmd, ...c.args);
		};

		if (command !== "chords.repeatLastChord") {
			saveLastChord();
			if (command !== "chords.toggleRecording") record();
		}
		await execCord(command);
	}
};
