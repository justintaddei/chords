const _charMap = {
	" ": "<space>",
};

export const charMap = new Proxy(_charMap, {
	get(target, prop, receiver) {
		if (typeof prop === "symbol") return Reflect.get(target, prop, receiver);
		const value = Reflect.get(target, prop, receiver);
		return value === undefined ? prop : value;
	},
}) as Record<string, string>;
