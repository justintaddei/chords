import vscode, { commands } from 'vscode'
import { config } from './config'
import { keyMap } from './keymap'

export type Mode = 'normal' | 'visual' | 'visual block' | 'visual line' | 'insert' | 'leader'

const initialStore = () => ({
  context: null as vscode.ExtensionContext | null,

  mode: config().get('defaultMode', 'insert') as Mode,

  cmdStr: [] as string[],

  // context for the current command
  cmd: {
    arg: '',
    select: false,
    pending: false,
  },

  recording: false,
  processing: false,
  selectionHistory: [] as (readonly vscode.Selection[])[],

  // state needed for block cursor correction
  blockCursorCorrection: false,
  isMouseSelection: false,
  recordedColumns: [] as number[],
  selectionUpdatedByChords: false,

  keyMap: {
    commands: {
      ...keyMap.commands,
      ...config().get('keyMap.commands', {}),
    },
    operators: {
      ...keyMap.operators,
      ...config().get('keyMap.operators', {}),
    },
    motions: {
      ...keyMap.motions,
      ...config().get('keyMap.motions', {}),
    }
  },

  // debug options
  debug: false,
  debugJump: false,
})

export const computed = {
  get isVisualMode() {
    return get('mode').startsWith('visual')
  },
  get isNormalMode() {
    return get('mode') === 'normal'
  },
  get isInsertMode() {
    return get('mode') === 'insert'
  }
}

/* 
  chords: {
    normal: {
      ...defaultChords.normal,
      ...config().get('normalMode.overrides'),
    },
    visual: {
      ...defaultChords.visual,
      ...config().get('visualMode.overrides'),
    },
    leader: {
      ...defaultChords.leader,
      ...config().get('leaderMode.overrides'),
    },
    insert: {},

  } as Record<Mode, ChordMap>,
*/

let store = initialStore()

export type Store = typeof store

const subscribers = new Map<keyof Store, ((store: Readonly<Store>) => void)[]>()


export const set = <K extends keyof Store>(key: K, value: Store[K]) => {
  store[key] = value
  notify(key)
}

type StoreObjects = {
  [K in keyof Store]: Store[K] extends Record<string, any> ? Store[K] extends any[] ? never : K : never
}[keyof Store]

export const merge = <K extends StoreObjects>(key: K, value: Partial<Store[K]>) => {
  store[key] = { ...store[key], ...value }
  notify(key)
}

export const notify = <K extends keyof Store>(key: K) => {
  const subs = subscribers.get(key)
  if (!subs) return
  for (const sub of subs) sub(store)
}

export const get = <K extends keyof Store>(key: K) => store[key]

export const reset = (key: keyof Store) =>
  set(key, initialStore()[key])


export const subscribe = <K extends [keyof Store, ...(keyof Store)[]]>(
  keys: K,
  cb: (store: Readonly<Store>) => void
) => {
  cb(store)

  for (const key of keys) {
    const subs = subscribers.get(key) ?? []
    subscribers.set(key, [...subs, cb])
  }

  return () => {
    for (const key of keys) {
      const subs = subscribers.get(key)
      if (subs)
        subscribers.set(
          key,
          subs.filter((sub) => sub !== cb)
        )
    }
  }
}

export const notifyAll = () => {
  for (const subs of subscribers.values()) for (const sub of subs) sub(store)
}

export const destroy = () => {
}

vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('chords')) {
    const context = get('context')

    destroy()
    store = initialStore()

    set('context', context)

    notifyAll()

    console.log('[chords] configuration reloaded')
  }
})
