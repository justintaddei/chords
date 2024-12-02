import * as vscode from "vscode";
import { subscribeToCapsLock, turnOffCapsLock } from "./utils/caps-lock";

type ChordAction = string | string[];

type Chord =
	| ChordAction
	| {
			visual?: ChordAction;
			normal?: ChordAction;
	  };

export class CapMotions {
	private context: vscode.ExtensionContext;
	private statusBarMode: vscode.StatusBarItem =
		vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10001);
	private statusBarChord: vscode.StatusBarItem =
		vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000);

	private chords: Record<string, Chord> = {};

	private leaderKey = "";
	private _chord = "";
	private timedMessage: NodeJS.Timeout | undefined = undefined;
	private selectionHistory: (readonly vscode.Selection[])[] = [];

	get chord() {
		return this._chord;
	}

	set chord(value: string) {
		this._chord = value;
		if (value) this.setMessage(value);
		else this.clearMessage();
	}

	private setMessage(message: string) {
		clearTimeout(this.timedMessage);
		this.timedMessage = undefined;

		this.statusBarChord.text = message;
		this.statusBarChord.color = "var(--vscode-errorLens-hintForeground)";
		this.statusBarChord.show();
	}

	private clearMessage() {
		if (this.timedMessage) return;

		this.statusBarChord.text = "";
		this.statusBarChord.hide();
	}

	showWarning(message: string) {
		this.setMessage(message);
		this.statusBarChord.color = "var(--vscode-errorLens-errorForeground)";

		this.timedMessage = setTimeout(() => {
			this.timedMessage = undefined;
			this.clearMessage();
		}, 1500);
	}

	private _mode: "normal" | "visual" | "insert" = "insert";

	get mode() {
		return this._mode;
	}

	// todo: set the editor to visual mode when the user makes a selection?
	set mode(value: "normal" | "visual" | "insert") {
		if (!vscode.window.activeTextEditor) return;
		this._mode = value;
		this.clearCapture();

		this.statusBarMode.text = this._mode.toUpperCase();

		vscode.commands.executeCommand("setContext", "capmotions.mode", this._mode);
		// const getSymbols = async () => {
		// 	const docSymbols = (await vscode.commands.executeCommand(
		// 		"vscode.executeDocumentSymbolProvider",
		// 		vscode.window.activeTextEditor?.document.uri,
		// 	)) as vscode.DocumentSymbol[]; // cast here
		// 	console.log("Document Symbols:", docSymbols); // children prop won't show
		// 	console.log(docSymbols[0].children); // but they exist!
		// };
		// getSymbols();

		if (this._mode === "insert") {
			this.statusBarChord.hide();
			this.chord = "";
			this.statusBarMode.color = "var(--vscode-errorLens-infoForeground)";
			vscode.window.activeTextEditor.options.cursorStyle =
				vscode.TextEditorCursorStyle.Line;

			vscode.window.activeTextEditor.options.lineNumbers =
				vscode.TextEditorLineNumbersStyle.On;

			turnOffCapsLock(this.context);
		} else {
			this.statusBarChord.show();
		}

		if (this._mode === "normal") {
			this.statusBarMode.color = "var(--vscode-errorLens-hintForeground)";
			vscode.window.activeTextEditor.options.cursorStyle =
				vscode.TextEditorCursorStyle.Block;

			vscode.window.activeTextEditor.options.lineNumbers =
				vscode.TextEditorLineNumbersStyle.Relative;

			const newSelections: vscode.Selection[] = [];
			for (const selection of vscode.window.activeTextEditor.selections) {
				newSelections.push(
					new vscode.Selection(selection.active, selection.active),
				);
			}
			vscode.window.activeTextEditor.selections = newSelections;
		}
		if (this._mode === "visual") {
			this.statusBarMode.color = "var(--vscode-errorLens-warningForeground)";
			vscode.window.activeTextEditor.options.cursorStyle =
				vscode.TextEditorCursorStyle.BlockOutline;

			vscode.window.activeTextEditor.options.lineNumbers =
				vscode.TextEditorLineNumbersStyle.Relative;
		}
	}

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.readConfig();

		this.onInput = this.onInput.bind(this);

		this.context.subscriptions.push(this.statusBarMode);

		this.statusBarMode.show();

		subscribeToCapsLock(this.context, (capsLockOn) => {
			this.mode = capsLockOn ? "normal" : "insert";
		});

		this.registerCommands();
	}

	private readConfig() {
		const config = vscode.workspace.getConfiguration("capmotions");

		this.leaderKey = config.get("leaderKey", "<space>");
		this.chords = config.get("chords", {});
	}

	private registerCommands() {
		this.context.subscriptions.push(
			vscode.commands.registerCommand("capmotions.setInsertMode", () => {
				this.mode = "insert";
			}),
			vscode.commands.registerCommand("capmotions.setNormalMode", () => {
				this.mode = "normal";
			}),
			vscode.commands.registerCommand("capmotions.setVisualMode", () => {
				this.mode = "visual";
			}),
			vscode.commands.registerCommand(
				"capmotions.clearCapture",
				this.clearCapture.bind(this),
			),
			vscode.commands.registerCommand(
				"capmotions.saveSelections",
				this.saveSelections.bind(this),
			),
			vscode.commands.registerCommand(
				"capmotions.restoreSelections",
				this.restoreSelections.bind(this),
			),
			vscode.commands.registerCommand("capmotions.nextOccurrence", () => {
				this.capture((str: string) => this.cursorToOccurrence(str, "forward"));
			}),
			vscode.commands.registerCommand("capmotions.prevOccurrence", () => {
				this.capture((str: string) => this.cursorToOccurrence(str, "backward"));
			}),
			vscode.commands.registerCommand("capmotions.nextOccurrenceSelect", () => {
				this.capture((str: string) =>
					this.cursorToOccurrenceSelect(str, "forward"),
				);
			}),
			vscode.commands.registerCommand("capmotions.prevOccurrenceSelect", () => {
				this.capture((str: string) =>
					this.cursorToOccurrenceSelect(str, "backward"),
				);
			}),
			vscode.commands.registerCommand(
				"capmotions.selectAroundParentheses",
				() => {
					this.selectAroundBrackets("(");
				},
			),
		);
	}

	_onCapture: ((char: string) => void)[] = [];

	hasCapture() {
		return this._onCapture.length > 0;
	}

	capture(cb: (char: string) => void) {
		this._onCapture.push(cb);
		this.setMessage("(waiting for input)");
		vscode.commands.executeCommand("setContext", "capmotions.capture", true);
	}

	applyCapture() {
		for (const cb of this._onCapture) {
			cb(this.chord);
		}
		this.clearCapture();
	}

	clearCapture() {
		vscode.commands.executeCommand("setContext", "capmotions.capture", false);
		this._onCapture = [];
		this.clearMessage();
		this.chord = "";
	}

	onInput(char: string) {
		if (char === this.leaderKey) {
			this.chord += "<leader>";
		} else {
			this.chord += char;
		}

		if (this.hasCapture()) {
			this.applyCapture();
			return;
		}

		if (!this.hasValidChord()) {
			console.log(`No valid chord '${this.chord}' for mode '${this.mode}'`);
			this.showWarning("(invalid chord)");
			this.chord = "";
			return;
		}

		const [count, motion] = this.splitChord(this.chord);

		let captured: string | undefined;

		if (motion in this.chords) {
			for (let i = 0; i < count; i++) {
				const chord = this.chords[motion as keyof typeof this.chords];

				const execCord = (c: string | string[]) => {
					if (Array.isArray(c)) return c.forEach(execCord);

					this.chord = "";
					vscode.commands.executeCommand(c);
				};

				if (typeof chord === "string" || Array.isArray(chord)) {
					execCord(chord);
				} else if (this.mode in chord) {
					// todo: why doesn't typescript narrow this?
					// @ts-ignore
					execCord(chord[this.mode]);
				}
			}
		}
	}

	private splitChord(chord: string): [number, string] {
		const count = Number.parseInt(chord.match(/^\d+/)?.[0] ?? "", 10);
		const motion = chord.replace(/^\d+/, "");

		if (!Number.isFinite(count)) return [1, motion];

		return [count, motion];
	}

	private hasValidChord() {
		return Object.keys(this.chords).some((chord) => {
			const [, motion] = this.splitChord(this.chord);
			if (chord.startsWith(motion)) {
				if (typeof this.chords[chord] === "string") return true;
				if (Array.isArray(this.chords[chord])) return true;

				return this.mode in this.chords[chord];
			}

			return false;
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

	private cursorToOccurrence(
		string: string,
		direction: "forward" | "backward",
	) {
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

	private cursorToOccurrenceSelect(
		string: string,
		direction: "forward" | "backward",
	) {
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

	// todo: make this configurable
	private bracketPairs = [
		["(", ")"],
		["[", "]"],
		["{", "}"],
		["<", ">"],
		['"', '"'],
		["'", "'"],
	];
	// todo: add args to chords so we can call, for example, capmotions.selectAroundBrackets {arg: "("}
	private selectAroundBrackets(bracket: string) {
		if (!vscode.window.activeTextEditor) return;

		const brackets = this.bracketPairs.find((pair) => pair.includes(bracket));
		if (!brackets)
			return vscode.window.showErrorMessage(
				`Attempted to select around ${bracket}, but ${bracket} is not one of ${this.bracketPairs.map((p) => p.join("")).join(", ")}`,
			);

		const [left, right] = brackets;

		const searchDirection = left === bracket ? "left" : "right";

		const searchLeft = (
			pos: vscode.Position,
			initial = false,
		): vscode.Position | undefined => {
			const locatedBracket = this.findStringBackward(left, pos);
			if (initial && !locatedBracket) return searchRight(pos);

			return locatedBracket;
		};

		const searchRight = (
			pos: vscode.Position,
			initial = false,
		): vscode.Position | undefined => {
			const locatedBracket = this.findStringForward(left, pos);
			if (initial && !locatedBracket) return searchLeft(pos);

			return locatedBracket;
		};

		const search = (pos: vscode.Position) => {
			const leftBracketPosition =
				searchDirection === "left"
					? searchLeft(pos, true)
					: searchRight(pos, true);

			if (!leftBracketPosition) return;

			return new vscode.Selection(leftBracketPosition, leftBracketPosition);
		};

		const editor = vscode.window.activeTextEditor;
		const { selections } = editor;

		const newSelections: vscode.Selection[] = [];

		for (const selection of selections) {
			const bracketRange = search(selection.active);

			if (bracketRange) newSelections.push(bracketRange);
		}

		if (!newSelections.length)
			return this.showWarning("(no bracket pair found)");
		editor.selections = newSelections;

		vscode.commands.executeCommand("editor.action.selectToBracket");
	}
}
