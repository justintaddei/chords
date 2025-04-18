"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const chords_1 = require("../src/chords");
const descriptions_1 = require("../src/ui/descriptions");
const DOCS_OUTPUT = node_path_1.default.join(__dirname, '..', 'docs', 'descriptions.json');
const docs = {
    normal: {},
    visual: {},
    leader: {},
    insert: {},
};
const buildActions = (actions) => {
    if (typeof actions === 'string')
        return [
            typeof descriptions_1.descriptions[actions] === 'function'
                ? descriptions_1.descriptions[actions]()
                : descriptions_1.descriptions[actions],
        ];
    if (typeof actions === 'object' && 'cmd' in actions) {
        const description = descriptions_1.descriptions[actions.cmd];
        return typeof description === 'function'
            ? [description(...actions.args)]
            : [description];
    }
    const result = [];
    for (const action of actions) {
        result.push(...buildActions(action));
    }
    return result;
};
for (const mode of ['normal', 'visual', 'leader']) {
    docs[mode] = {};
    for (const [chord, actions] of Object.entries(chords_1.defaultChords[mode])) {
        docs[mode][chord] = buildActions(actions);
    }
}
(0, node_fs_1.writeFileSync)(DOCS_OUTPUT, JSON.stringify(docs, null, 2));
//# sourceMappingURL=docs.js.map