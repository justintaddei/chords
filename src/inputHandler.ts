import vscode from "vscode";
import { collapseSelections } from "./actions/collapseSelections";
import { type Chord, constructChord, getChord, isValid } from "./chords";
import { config } from "./config";
import { record } from "./recorder";
import { get, set, subscribe } from "./store";
import type { Mode } from "./types";
import { setMessage, showWarning } from "./ui/statusBar";
import { disposable } from "./utils/vscodeSubscriptionManager";

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
	if (get("replaying")) {
		const lastCapture = get("lastChord").capture;
		if (lastCapture) return Promise.resolve(cb(lastCapture));
	}

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
	if (char === config().get("leader")) {
		set("modeBeforeLeader", get("mode"));
		set("mode", "leader");
		return;
	}

	set("chord", get("chord").concat(char));

	if (waitingForCapture()) {
		applyCapture(char);
		return;
	}

	if (!isValid()) {
		console.log(
			`[chords] No valid chord '${constructChord()[1]}' for mode '${get("mode")}'`,
		);
		showWarning("(invalid chord)");
		set("chord", []);
		return;
	}

	const [count, motion] = constructChord();

	if (motion in get("chords")[get("mode")]) {
		set("chordActive", true);
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
				if (get("mode") === "leader") set("mode", get("modeBeforeLeader"));

				if (typeof c === "string")
					return await vscode.commands.executeCommand(c);

				await vscode.commands.executeCommand(c.cmd, ...c.args);
			};

			if (command !== "chords.repeatLastChord") {
				saveLastChord();
				if (command !== "chords.toggleRecording") record();
			}
			await execCord(command);
		}
		set("chordActive", false);
	}
};

subscribe(["mode"], ({ mode }) => {
	set("chord", []);

	if (mode === "normal") collapseSelections("anchor");
});

disposable(
	vscode.window.onDidChangeTextEditorSelection(({ selections }) => {
		if (get("chordActive")) return;

		const hasSelections = selections.some((s) => !s.isEmpty);

		if (get("mode") === "normal" && hasSelections) return set("mode", "visual");

		if (get("mode") === "visual" && !hasSelections)
			return set("mode", "normal");
	}),
);
