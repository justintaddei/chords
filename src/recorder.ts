import {
	type ChordDescriptor,
	applyCapture,
	onInput,
	waitingForCapture,
} from "./input-handler";
import { get, set } from "./store";
import { showWarning } from "./ui/status-bar";

export const record = (update = false) => {
	if (!get("recording")) return;

	const recordedChords = get("recordedChords");

	if (update) recordedChords.pop();

	recordedChords.push(structuredClone(get("lastChord")));

	set("recordedChords", recordedChords);
};

export const repeatChord = async (
	chord: ChordDescriptor = get("lastChord"),
) => {
	set("chord", []);

	set("mode", chord.mode);

	for (const char of chord.chord) await onInput(char);

	if (waitingForCapture() && chord.capture) applyCapture(chord.capture);
};

export const replay = async () => {
	if (!get("recordedChords").length) return showWarning("(nothing recorded)");

	for (const chord of get("recordedChords")) await repeatChord(chord);
};
