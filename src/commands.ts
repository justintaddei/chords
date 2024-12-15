import { collapseSelections } from "./actions/collapseSelections";
import { cursorTo } from "./actions/cursorTo";
import { cursorToParagraph } from "./actions/cursorToParagraph";
import { restoreSelections } from "./actions/restoreSelections";
import { saveSelections } from "./actions/saveSelections";
import { selectEnds } from "./actions/selectEnds";
import { selectSymbolAtCursor } from "./actions/selectSymbolAtCursor";
import { shrinkSelection } from "./actions/shrinkSelection";
import { awaitCapture, clearCapture } from "./input-handler";
import { repeatChord, replay } from "./recorder";
import { get, set } from "./store";
import { registerCmd } from "./utils/register-cmd";

// todo: args validation for all commands. Using zod?

console.log("[chords] commands registered");

registerCmd("chords.repeatLastChord", repeatChord);

registerCmd("chords.toggleRecording", () => {
	set("recording", !get("recording"));
});

registerCmd("chords.replay", replay);

registerCmd("chords.setInsertMode", () => {
	set("mode", "insert");
});

registerCmd("chords.setNormalMode", () => {
	set("mode", "normal");
});

registerCmd("chords.setVisualMode", () => {
	set("mode", "visual");
});

registerCmd("chords.setLeaderMode", () => {
	set("mode", "leader");
});

registerCmd("chords.clearCapture", clearCapture);

registerCmd("chords.saveSelections", saveSelections);

registerCmd("chords.restoreSelections", restoreSelections);

registerCmd("chords.restoreCursors", () => {
	restoreSelections();
	collapseSelections("anchor");
});

registerCmd("chords.cursorToCharRight", () =>
	awaitCapture((char) => {
		cursorTo(char, "right");
	}),
);

registerCmd("chords.cursorToCharLeft", () =>
	awaitCapture((char) => {
		cursorTo(char, "left");
	}),
);

registerCmd("chords.cursorToCharRightSelect", () =>
	awaitCapture((char) => {
		cursorTo(char, "right", true);
	}),
);

registerCmd("chords.cursorToCharLeftSelect", () =>
	awaitCapture((char) => {
		cursorTo(char, "left", true);
	}),
);

registerCmd("chords.selectAroundLeft", (ends: [string, string]) => {
	selectEnds(ends, "left");
});

registerCmd("chords.selectAroundRight", (ends: [string, string]) => {
	selectEnds(ends, "right");
});

registerCmd("chords.selectInsideLeft", (ends: [string, string]) => {
	selectEnds(ends, "left", true);
});

registerCmd("chords.selectInsideRight", (ends: [string, string]) => {
	selectEnds(ends, "right", true);
});

registerCmd("chords.shrinkSelection", shrinkSelection);

registerCmd("chords.selectSymbolAtCursor", selectSymbolAtCursor);

registerCmd("chords.paragraphUp", () => {
	cursorToParagraph("up");
});

registerCmd("chords.paragraphDown", () => {
	cursorToParagraph("down");
});

registerCmd("chords.paragraphUpSelect", () => {
	cursorToParagraph("up", true);
});

registerCmd("chords.paragraphDownSelect", () => {
	cursorToParagraph("down", true);
});

// registerCmd("chords.killCapsLockRemapper", () => {
// 	this.killCapsLockRemapper?.();
// });

// if (process.platform === "win32" && this.config.get("remapCapsLock")) {
// 	this.killCapsLockRemapper = remapCapsLock(this.context);
// 	vscode.commands.executeCommand("setContext", "chords.remappedCapsLock", true);
// }
