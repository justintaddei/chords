import { writeFileSync } from "node:fs";
import path from "node:path";
import { type Chord, type ChordMap, defaultChords } from "../src/chords";
import type { Mode } from "../src/types";
import { descriptions } from "../src/ui/descriptions";

const DOCS_OUTPUT = path.join(__dirname, "..", "docs", "descriptions.json");

const docs: Record<Mode, Record<string, string[]>> = {
	normal: {},
	visual: {},
	leader: {},
	insert: {},
};

const buildActions = (actions: Chord): string[] => {
	if (typeof actions === "string")
		return [
			typeof descriptions[actions] === "function"
				? descriptions[actions]()
				: descriptions[actions],
		];

	if (typeof actions === "object" && "cmd" in actions) {
		const description = descriptions[actions.cmd];

		return typeof description === "function"
			? [description(...actions.args)]
			: [description];
	}

	const result: string[] = [];

	for (const action of actions) {
		result.push(...buildActions(action));
	}

	return result;
};

for (const mode of ["normal", "visual", "leader"] as const) {
	docs[mode] = {};

	for (const [chord, actions] of Object.entries(defaultChords[mode])) {
		docs[mode][chord] = buildActions(actions);
	}
}

writeFileSync(DOCS_OUTPUT, JSON.stringify(docs, null, 2));
