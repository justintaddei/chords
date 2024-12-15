import vscode from "vscode";
import { type ChordMap, defaultChords } from "./chord";
import { config } from "./config";
import type { ChordDescriptor } from "./input-handler";
import type { Mode } from "./types";
import { disposable } from "./utils/vscode-subscription-manager";

const initialStore = () => ({
	mode: config.get("defaultMode", "insert") as Mode,
	recording: false,
	chord: [] as string[],
	onCapture: [] as ((char: string, canceled: boolean) => Promise<void>)[],
	context: null as vscode.ExtensionContext | null,
	selectionHistory: [] as (readonly vscode.Selection[])[],
	lastChord: {
		chord: [],
		mode: config.get("defaultMode", "insert"),
		capture: null,
	} as ChordDescriptor,
	recordedChords: [] as ChordDescriptor[],
	chords: {
		normal: {
			...defaultChords.normal,
			...config.get("normalMode.overrides"),
		},
		visual: {
			...defaultChords.visual,
			...config.get("visualMode.overrides"),
		},
		leader: {
			...defaultChords.leader,
			...config.get("leaderMode.overrides"),
		},
		insert: {},
	} as Record<Mode, ChordMap>,
});

const store = initialStore();

type Store = typeof store;

const subscribers = new Map<
	keyof Store,
	((store: Readonly<Store>) => void)[]
>();

export const set = <K extends keyof Store>(key: K, value: Store[K]) => {
	store[key] = value;
	const subs = subscribers.get(key);
	if (!subs) return;
	for (const sub of subs) sub(store);
};

export const get = <K extends keyof Store>(key: K) => store[key];

export const subscribe = <K extends [keyof Store, ...(keyof Store)[]]>(
	keys: K,
	cb: (store: Readonly<Store>) => void,
) => {
	cb(store);

	for (const key of keys) {
		const subs = subscribers.get(key) ?? [];
		subscribers.set(key, [...subs, cb]);
	}

	return () => {
		for (const key of keys) {
			const subs = subscribers.get(key);
			if (subs)
				subscribers.set(
					key,
					subs.filter((sub) => sub !== cb),
				);
		}
	};
};

const notifyAll = () => {
	for (const subs of subscribers.values()) for (const sub of subs) sub(store);
};

disposable(
	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration("chords")) {
			notifyAll();
		}
	}),
);
