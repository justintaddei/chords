import * as vscode from "vscode";
import chords, { type Chord, type ChordMap } from "./chord-map";
import {
	cursorStyleMap,
	isValidEnum,
	lineNumbersMap,
} from "./utils/vscode-enum-maps";

type Mode = "normal" | "visual" | "insert" | "leader";

type ChordDescriptor = {
	chord: string[];
	mode: Mode;
	capture: null | string;
};

export class Chords {
	private config = vscode.workspace.getConfiguration("chords");

	private context: vscode.ExtensionContext;
	private statusBarMode: vscode.StatusBarItem =
		vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
			this.config.get("statusIndicator.priority"),
		);
	private statusBarChord: vscode.StatusBarItem =
		vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
			this.config.get("statusIndicator.priority"),
		);

	private chords: Record<Exclude<Mode, "insert">, ChordMap> = {
		...chords,
		...this.config.get("chords"),
	};

	private recordedChords: ChordDescriptor[] = [];
	private record(update = false) {
		if (!this.recording) return;

		if (update) this.recordedChords.pop();

		this.recordedChords.push(structuredClone(this.lastChord));
	}
	private _recording = false;
	private get recording() {
		return this._recording;
	}
	private set recording(value: boolean) {
		this._recording = value;
		if (value) this.recordedChords = [];
		else
			vscode.workspace.openTextDocument({
				content: JSON.stringify(this.recordedChords, null, 2),
			});
		this.mode = this.mode;
	}
	private async replay() {
		if (!this.recordedChords.length)
			return this.showWarning("(nothing recorded)");

		for (const chord of this.recordedChords) await this.repeatChord(chord);
	}

	private leaderKey = this.config.get("leader");
	private _chord: string[] = [];

	private selectionHistory: (readonly vscode.Selection[])[] = [];
	private timedMessage: NodeJS.Timeout | undefined = undefined;

	private lastChord: ChordDescriptor = {
		chord: [] as string[],
		mode: this.mode,
		capture: null as null | string,
	};

	private saveState() {
		this.lastChord.chord = structuredClone(this._chord);
		this.lastChord.mode = this.mode;
	}

	private async repeatChord(chord: ChordDescriptor = this.lastChord) {
		this.clearChord();

		this.mode = chord.mode;

		for (const char of chord.chord) await this.onInput(char);

		if (this.waitingForCapture() && chord.capture)
			this.applyCapture(chord.capture);
	}

	get chord() {
		return this._chord.join("");
	}

	updateChord(value: string) {
		this._chord.push(value);
		if (this.chord) this.setMessage(this.chord);
		else this.clearMessage();
	}

	clearChord() {
		this._chord = [];
		this.clearMessage();
	}

	private setMessage(message: string) {
		clearTimeout(this.timedMessage);
		this.timedMessage = undefined;

		this.statusBarChord.text = message;
		this.statusBarChord.color = "var(--vscode-charts-green)";
		this.statusBarChord.show();
	}

	private clearMessage() {
		if (this.timedMessage) return;

		this.statusBarChord.text = "";
		this.statusBarChord.hide();
	}

	showWarning(message: string) {
		this.setMessage(message);
		this.statusBarChord.color = "var(--vscode-charts-red)";

		this.timedMessage = setTimeout(() => {
			this.timedMessage = undefined;
			this.clearMessage();
		}, 1500);
	}

	set cursorStyle(value: string | undefined) {
		if (!vscode.window.activeTextEditor) return;

		if (!isValidEnum(value, cursorStyleMap)) {
			console.error(
				"Invalid cursor style:",
				value,
				". Valid values are:",
				Object.keys(cursorStyleMap),
			);
			return;
		}

		vscode.window.activeTextEditor.options.cursorStyle = cursorStyleMap[value];
	}

	set lineNumbers(value: string | undefined) {
		if (!vscode.window.activeTextEditor) return;

		if (!isValidEnum(value, lineNumbersMap)) {
			console.error(
				"Invalid line numbers style:",
				value,
				". Valid values are:",
				Object.keys(lineNumbersMap),
			);
			return;
		}

		vscode.window.activeTextEditor.options.lineNumbers = lineNumbersMap[value];
	}

	private _mode: Mode = "insert";
	get mode() {
		return this._mode;
	}

	// todo: set the editor to visual mode when the user makes a selection?
	set mode(value: Mode) {
		if (!vscode.window.activeTextEditor) return;

		this._mode = value;
		this.clearChord();
		this.clearCapture();

		this.statusBarMode.text = this.recording
			? `🔴 ${this._mode.toUpperCase()}`
			: this._mode.toUpperCase();

		vscode.commands.executeCommand("setContext", "chords.mode", this._mode);

		if (this._mode === "insert") {
			this.statusBarChord.hide();
			this.statusBarMode.color = "var(--vscode-charts-blue)";
			this.cursorStyle = vscode.workspace
				.getConfiguration("editor")
				.get("cursorStyle");
			this.lineNumbers = vscode.workspace
				.getConfiguration("editor")
				.get("lineNumbers");
		} else {
			this.statusBarChord.show();
		}

		if (this._mode === "leader") {
			this.statusBarMode.color = "var(--vscode-charts-purple)";
		}

		if (this._mode === "normal") {
			this.statusBarMode.color = "var(--vscode-charts-green)";
			this.cursorStyle = this.config.get("normalMode.cursorStyle");
			this.lineNumbers = this.config.get("normalMode.lineNumbers");
		}

		if (this._mode === "visual") {
			this.statusBarMode.color = "var(--vscode-charts-orange)";
			this.cursorStyle = this.config.get("visualMode.cursorStyle");
			this.lineNumbers = this.config.get("visualMode.lineNumbers");
		}
	}

	constructor(context: vscode.ExtensionContext) {
		this.context = context;

		this.onInput = this.onInput.bind(this);

		this.context.subscriptions.push(this.statusBarMode);
		this.context.subscriptions.push(this.statusBarChord);

		this.statusBarMode.show();

		// this.unsubscribeFromCapsLock = subscribeToCapsLock(
		// 	this.context,
		// 	(capsLockOn) => {
		// 		this.mode = capsLockOn ? "normal" : "insert";
		// 	},
		// );

		this.mode = "insert";

		this.register("chords.repeatLastChord", this.repeatChord);
		this.register("chords.toggleRecording", () => {
			this.recording = !this.recording;
		});
		this.register("chords.replay", this.replay);
		this.register("chords.setInsertMode", () => {
			this.mode = "insert";
		});
		this.register("chords.setNormalMode", () => {
			this.mode = "normal";
		});
		this.register("chords.setVisualMode", () => {
			this.mode = "visual";
		});
		this.register("chords.setLeaderMode", () => {
			this.mode = "leader";
		});
		this.register("chords.clearCapture", this.clearCapture);
		this.register("chords.saveSelections", this.saveSelections);
		this.register("chords.restoreSelections", this.restoreSelections);
		this.register("chords.restoreCursors", this.restoreCursors);
		this.register("chords.nextOccurrence", () =>
			this.awaitCapture((char) => this.cursorTo(char, "forward")),
		);
		this.register("chords.prevOccurrence", () =>
			this.awaitCapture((char) => this.cursorTo(char, "backward")),
		);
		this.register("chords.nextOccurrenceSelect", () =>
			this.awaitCapture((char) => this.cursorToSelect(char, "forward")),
		);
		this.register("chords.prevOccurrenceSelect", () =>
			this.awaitCapture((char) => this.cursorToSelect(char, "backward")),
		);
		this.register("chords.selectAroundLeft", this.selectAroundLeft);
		this.register("chords.selectAroundRight", this.selectAroundRight);
		this.register("chords.selectInsideLeft", this.selectInsideLeft);
		this.register("chords.selectInsideRight", this.selectInsideRight);
		this.register("chords.shrinkSelection", this.shrinkSelection);
		this.register("chords.selectSymbolAtCursor", this.selectSymbolAtCursor);
	}

	destroy() {
		// this.unsubscribeFromCapsLock();
	}

	// biome-ignore lint/suspicious/noExplicitAny: any is the appropriate type
	private register(cmd: string, callback: (...args: any[]) => any) {
		this.context.subscriptions.push(
			vscode.commands.registerCommand(cmd, callback, this),
		);
	}

	_onCapture: ((char: string) => void)[] = [];

	waitingForCapture() {
		return this._onCapture.length > 0;
	}

	awaitCapture(cb: (char: string) => void) {
		this._onCapture.push(cb);
		this.setMessage("(waiting for input)");
		vscode.commands.executeCommand("setContext", "chords.capture", true);
	}

	applyCapture(char: string) {
		this.lastChord.capture = char;
		for (const cb of this._onCapture) {
			cb(char);
		}
		this.record(true);
		this.clearCapture();
	}

	clearCapture() {
		vscode.commands.executeCommand("setContext", "chords.capture", false);
		this._onCapture = [];
		this.lastChord = { chord: [], mode: this.mode, capture: null };
		this.clearMessage();
		this.clearChord();
	}

	async onInput(char: string) {
		if (this.mode === "insert") return;

		if (char === this.leaderKey) {
			this.mode = "leader";
			return;
		}

		this.updateChord(char);

		if (this.waitingForCapture()) {
			this.applyCapture(char);
			return;
		}

		if (!this.hasValidChord()) {
			console.log(`No valid chord '${this.chord}' for mode '${this.mode}'`);
			this.showWarning("(invalid chord)");
			this.clearChord();
			return;
		}

		const [count, motion] = this.splitChord(this.chord);

		if (motion in this.chords[this.mode]) {
			for (let i = 0; i < count; i++) {
				const command = this.chords[this.mode][motion];

				const execCord = async (c: Chord) => {
					if (Array.isArray(c)) {
						for (const _c of c) await execCord(_c);
						return;
					}

					this.clearChord();
					if (this.mode === "leader") this.mode = "normal";

					if (typeof c === "string")
						return await vscode.commands.executeCommand(c);

					await vscode.commands.executeCommand(c.cmd, ...c.args);
				};

				if (command !== "chords.repeatLastChord") {
					this.saveState();
					if (command !== "chords.toggleRecording") this.record();
				}
				await execCord(command);
			}
		}
	}

	private splitChord(chord: string): [number, string] {
		const count = Number.parseInt(chord.match(/^\d+/)?.[0] ?? "", 10);
		const motion = chord.replace(/^\d+/, "");

		if (this.mode === "leader") return [1, motion];
		if (!Number.isFinite(count)) return [1, motion];

		return [count, motion];
	}

	private hasValidChord() {
		if (this.mode === "insert") return false;

		return Object.keys(this.chords[this.mode]).some((chord) => {
			const [, motion] = this.splitChord(this.chord);
			return chord.startsWith(motion);
		});
	}

	saveSelections() {
		if (!vscode.window.activeTextEditor) return;

		this.selectionHistory.push(vscode.window.activeTextEditor.selections);
	}

	restoreSelections() {
		if (!vscode.window.activeTextEditor) return;
		if (!this.selectionHistory.length) return;

		const selections = this.selectionHistory.pop();
		if (!selections) return;
		vscode.window.activeTextEditor.selections = selections;
	}

	private restoreCursors() {
		this.restoreSelections();
		this.collapseSelections("anchor");
	}

	private collapseSelections(direction: "start" | "end" | "anchor" | "active") {
		if (!vscode.window.activeTextEditor) return;

		const newSelections: vscode.Selection[] = [];
		for (const selection of vscode.window.activeTextEditor.selections) {
			newSelections.push(
				new vscode.Selection(selection[direction], selection[direction]),
			);
		}
		vscode.window.activeTextEditor.selections = newSelections;
	}

	private findStringForward(
		char: string,
		position: vscode.Position,
		offset = 0,
	) {
		if (!vscode.window.activeTextEditor) return;

		const editor = vscode.window.activeTextEditor;
		const startIndex = editor.document.offsetAt(position);
		const text = editor.document.getText();

		const index = text.indexOf(char, startIndex + 1);

		if (index === -1) return;

		return editor.document.positionAt(index + offset);
	}

	private findStringBackward(
		str: string,
		position: vscode.Position,
		offset = 0,
	) {
		if (!vscode.window.activeTextEditor) return;

		const editor = vscode.window.activeTextEditor;
		const startIndex = editor.document.offsetAt(position);
		const text = editor.document.getText();

		const index = text.lastIndexOf(str, startIndex - 1);

		if (index === -1) return;

		return editor.document.positionAt(index + offset);
	}

	private cursorTo(string: string, direction: "forward" | "backward") {
		if (!vscode.window.activeTextEditor) return;

		const editor = vscode.window.activeTextEditor;
		const { selections } = editor;

		const newSelections: vscode.Selection[] = [];

		for (const selection of selections) {
			let nextPosition: vscode.Position | undefined;

			if (direction === "forward") {
				nextPosition = this.findStringForward(string, selection.active);
			} else {
				nextPosition = this.findStringBackward(string, selection.active);
			}

			if (!nextPosition) continue;
			newSelections.push(new vscode.Selection(nextPosition, nextPosition));
		}

		if (!newSelections.length) return this.showWarning("(no match found)");
		editor.selections = newSelections;

		editor.revealRange(newSelections[0]);
	}

	private cursorToSelect(string: string, direction: "forward" | "backward") {
		if (!vscode.window.activeTextEditor) return;

		const editor = vscode.window.activeTextEditor;
		const { selections } = editor;

		const newSelections: vscode.Selection[] = [];

		for (const selection of selections) {
			let nextPosition: vscode.Position | undefined;

			if (direction === "forward") {
				nextPosition = this.findStringForward(string, selection.active, 1);
			} else {
				nextPosition = this.findStringBackward(string, selection.active);
			}

			if (!nextPosition) continue;
			newSelections.push(new vscode.Selection(selection.anchor, nextPosition));
		}

		if (!newSelections.length) return this.showWarning("(no match found)");
		editor.selections = newSelections;

		editor.revealRange(newSelections[0]);
	}

	private isBracketPair(left: string, right: string) {
		const pairs = {
			"(": ")",
			"[": "]",
			"{": "}",
			"<": ">",
		};

		return left in pairs && pairs[left as keyof typeof pairs] === right;
	}

	private async selectAroundLeft(left: string, right: string) {
		this.cursorTo(left, "backward");

		if (this.isBracketPair(left, right))
			return await vscode.commands.executeCommand(
				"editor.action.selectToBracket",
			);

		this.cursorToSelect(right, "forward");
	}

	private async selectAroundRight(left: string, right: string) {
		this.cursorTo(left, "forward");

		if (this.isBracketPair(left, right))
			return await vscode.commands.executeCommand(
				"editor.action.selectToBracket",
			);

		this.cursorToSelect(right, "forward");
	}

	private async selectInsideLeft(left: string, right: string) {
		await this.selectAroundLeft(left, right);
		this.shrinkSelection();
	}

	private async selectInsideRight(left: string, right: string) {
		await this.selectAroundRight(left, right);
		this.shrinkSelection();
	}

	private shrinkSelection(insetStart = 1, insetEnd = 1) {
		if (!vscode.window.activeTextEditor) return;

		const editor = vscode.window.activeTextEditor;
		const selections = editor.selections;
		const newSelections = [];

		for (const selection of selections) {
			const start = editor.document.offsetAt(selection.start);
			const end = editor.document.offsetAt(selection.end);

			if (start === end) {
				newSelections.push(selection);
				continue;
			}

			// todo: what is the expected behavior here?
			if (start + insetStart > end || end - insetEnd < start) {
				const midpoint = editor.document.positionAt(
					start + Math.floor((end - start) / 2),
				);
				newSelections.push(new vscode.Selection(midpoint, midpoint));
				continue;
			}

			const startPosition = editor.document.positionAt(start + insetStart);
			const endPosition = editor.document.positionAt(end - insetEnd);

			newSelections.push(new vscode.Selection(startPosition, endPosition));
		}

		vscode.window.activeTextEditor.selections = newSelections;
	}

	private async selectSymbolAtCursor() {
		if (!vscode.window.activeTextEditor) return;

		const symbols = (await (() =>
			vscode.commands.executeCommand(
				"vscode.executeDocumentSymbolProvider",
				vscode.window.activeTextEditor?.document.uri,
			))()) as vscode.DocumentSymbol[];

		const editor = vscode.window.activeTextEditor;

		const findSymbol = (
			symbols: vscode.DocumentSymbol[],
			selection: vscode.Selection,
		): vscode.DocumentSymbol | undefined => {
			for (const symbol of symbols) {
				if (
					symbol.range.contains(selection.active) &&
					!symbol.range.isEqual(selection)
				) {
					if (symbol.children.length > 0) {
						const deeperSymbol = findSymbol(symbol.children, selection);

						return deeperSymbol ?? symbol;
					}
					return symbol;
				}
			}
		};

		const newSelections: vscode.Selection[] = [];

		for (const selection of editor.selections) {
			const symbol = findSymbol(symbols, selection);

			if (!symbol) continue;

			newSelections.push(
				new vscode.Selection(symbol.range.start, symbol.range.end),
			);
		}

		editor.selections = newSelections;
	}
}
