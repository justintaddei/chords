import type vscode from "vscode";

type SimpleRange = {
	start: number;
	end: number;
};

export function findQuoteRange(
	ranges: SimpleRange[],
	position: vscode.Position,
): SimpleRange | undefined {
	const insideResult = ranges.find(
		(x) => x.start <= position.character && x.end >= position.character,
	);

	if (insideResult) {
		return insideResult;
	}

	const outsideResult = ranges.find((x) => x.start > position.character);

	if (outsideResult) {
		return outsideResult;
	}

	return undefined;
}

export function quoteRanges(quoteChar: string, s: string): SimpleRange[] {
	let insideQuote = false;
	let stateStartIndex = 0;
	let escaped = false;
	const ranges = [];

	for (let i = 0; i < s.length; ++i) {
		if (s[i] === quoteChar && !escaped) {
			if (insideQuote) {
				ranges.push({
					start: stateStartIndex,
					end: i,
				});

				insideQuote = false;
			} else {
				insideQuote = true;
				stateStartIndex = i;
			}
		}

		if (s[i] === "\\") {
			escaped = !escaped;
		} else {
			escaped = false;
		}
	}

	return ranges;
}
