import { readFileSync, writeFileSync } from 'node:fs';

type KeyBinding = {
  key: string;
  command: string;
  when: string;
  args: string;
};

const keybindings = [] as KeyBinding[];

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const numbers = '0123456789'.split('');
const specials = "`-=[]\\;',./".split('');
const others = ['tab', 'enter', 'escape', 'backspace', 'space', 'delete'];

const keys = [...alphabet, ...numbers, ...specials, ...others];

const modifiers = ['ctrl', 'shift', 'ctrl+shift'];

const shiftedKeys = {
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '0': ')',
  '-': '_',
  '=': '+',
  '[': '{',
  ']': '}',
  '\\': '|',
  ';': ':',
  "'": '"',
  ',': '<',
  '.': '>',
  '/': '?',
  tab: 'S-tab',
  enter: 'S-enter',
  escape: 'S-escape',
  backspace: 'S-backspace',
  space: 'S-space',
  delete: 'S-delete',
} as const;

const whenSafeName = {
  '&': 'ampersand',
  '(': 'parenleft',
  ')': 'parenright',
  "'": 'singlequote',
  '=': 'equal',
  '`': 'backtick',
  '!': 'exclamation',
  '|': 'bar',
} as const;

const hasShift = (key: string): key is keyof typeof shiftedKeys =>
  key in shiftedKeys;

const vimSyntax = (mod: string, key: string): string => {
  if (mod === 'ctrl') return `<C-${key}>`;
  const shiftedKey = hasShift(key) ? shiftedKeys[key] : key.toUpperCase();
  if (mod === 'shift') return `<${shiftedKey}>`;
  if (mod === 'ctrl+shift') return `<C-${shiftedKey}>`;
  throw new Error(`Unknown modifier combo: ${mod}+${key}`);
};

export const makeWhenSafe = (key: string) => {
  return key
    .split('')
    .map((c) => whenSafeName[c as keyof typeof whenSafeName] ?? c)
    .join('');
};

for (const key of others)
  keybindings.push({
    key,
    command: 'chords.input',
    when:
      key === 'escape'
        ? 'editorTextFocus'
        : 'editorTextFocus && !chords.bypass',
    args: `<${key}>`,
  });

for (const key of keys) {
  for (const modifier of modifiers) {
    if (modifier === 'shift' && !others.includes(key)) continue;

    const vimKey = vimSyntax(modifier, key);
    const whenSafe = makeWhenSafe(vimKey);
    const listen =
      modifier === 'shift'
        ? '!chords.bypass'
        : ['normal', 'visual']
          .map(
            (mode) =>
              `(chords.listen.${whenSafe}.${mode} && chords.effectiveMode == '${mode}')`,
          )
          .join(' || ');

    keybindings.push({
      key: `${modifier}+${key}`,
      command: 'chords.input',
      when: `editorTextFocus && ${listen}`,
      args: vimKey,
    });
  }
}

export const handledBindings = keybindings.map((k) => k.args);

if (process.argv.includes('--write')) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

  pkg.contributes.keybindings = keybindings;

  writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}
