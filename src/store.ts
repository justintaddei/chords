import vscode from 'vscode';
import { MotionType, NormalState, cmd_T } from './cmds/normal_defs';
import { OP } from './cmds/ops_defs';
import { config } from './config';
import { Cursor, Direction } from './globals';
import { editor } from './helpers';

export type Mode =
  | 'normal'
  | 'visual'
  | 'visual block'
  | 'visual line'
  | 'insert'
  | 'replace';

export const initialNormalState = (): NormalState => {
  const opArgs = {
    op_type: OP.NOP,
    regName: '',
    motion_type: MotionType.CharWise,
    inclusive: false,
    motion_force: false,
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 },
    lineCount: 0,
    empty: true,
  } as const;

  return {
    command_finished: true,
    opArgs,
    cmdArgs: {
      opArgs,
      cmdChar: '',
      nextChar: '',
      extraChar: '',
      opCount: 0,
      count0: 0,
      count1: 0,
      arg: 0,
    },
    char: '',
    cmd: null as unknown as cmd_T,
    old_col: 0,
    old_pos: { line: 0, column: 0 },
  };
};

const initialStore = () => ({
  extContext: null as vscode.ExtensionContext | null,
  mode: config().get('startIn', 'insert') as Mode,
  executing: false,
  input: [] as string[],
  recording: false,
  keymaps: config().get('keymaps', []) as [
    ('normal' | 'visual')[],
    string,
    string,
  ][],
  vimState: initialNormalState(),

  // vim stuff outside of vimState
  set_curswant: true,
  _curswant: new WeakMap<vscode.TextEditor, number[]>(),
  _cursors: new WeakMap<vscode.TextEditor, Cursor[]>(),
  csearch_lastc: '',
  csearch_lastcdir: Direction.DirectionNotSet as Direction,
  csearch_until: false,
  // debug options
  debug: false,
});

export const computed = {
  get isVisualMode() {
    return get('mode').startsWith('visual');
  },
  get isNormalMode() {
    return get('mode') === 'normal';
  },
  get isInsertMode() {
    return get('mode') === 'insert';
  },
  get curswant() {
    return get('_curswant').get(editor()) ?? [];
  },
  set curswant(value: number[]) {
    get('_curswant').set(editor(), value);
  },
  get cursors() {
    return get('_cursors').get(editor()) ?? [];
  },
  set cursors(value: Cursor[]) {
    get('_cursors').set(editor(), value);
  },
};

let store = initialStore();

export type Store = typeof store;

const subscribers = new Map<
  keyof Store,
  ((store: Readonly<Store>) => void)[]
>();

export const set = <K extends keyof Store>(key: K, value: Store[K]) => {
  if (store[key] === value) return;
  store[key] = value;
  notify(key);
};

type ArrayStoreKeys = {
  [K in keyof Store]: Store[K] extends unknown[] ? K : never;
}[keyof Store];

export const push = <K extends ArrayStoreKeys>(
  key: K,
  ...value: Store[K][number][]
) => {
  (store[key] as (typeof value)[]).push(value);
  notify(key);
};

type StoreObjects = {
  [K in keyof Store]: Store[K] extends Record<string, unknown>
    ? Store[K] extends unknown[]
      ? never
      : K
    : never;
}[keyof Store];

export const mutate = <K extends StoreObjects>(key: K) =>
  new Proxy(store[key], {
    get(target, prop) {
      return target[prop as keyof Store[K]];
    },
    set(target, prop, value) {
      target[prop as keyof Store[K]] = value;
      notify(key);
      return true;
    },
  });

export const notify = <K extends keyof Store>(key: K) => {
  const subs = subscribers.get(key);
  if (!subs) return;
  for (const sub of subs) sub(store);
};

export const get = <K extends keyof Store>(key: K) => store[key];

export const reset = (key: keyof Store) => set(key, initialStore()[key]);

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

export const notifyAll = () => {
  for (const subs of subscribers.values()) for (const sub of subs) sub(store);
};

export const destroy = () => {};

vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('chords')) {
    const context = get('extContext');

    destroy();
    store = initialStore();

    set('extContext', context);

    notifyAll();

    console.log('[chords] configuration reloaded');
  }
});
