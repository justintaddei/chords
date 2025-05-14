import vscode from 'vscode'
import { ChordMap, defaultChords } from './chords'
import { config } from './config'

export type Mode = 'normal' | 'visual' | 'insert' | 'leader'

const initialStore = () => ({
  debug: false,
  debugJump: false,
  context: null as vscode.ExtensionContext | null,
  mode: config().get('defaultMode', 'insert') as Mode,
  blockCursorCorrection: false,
  recording: false,
  processing: false,
  chord: [] as string[],
  selectionHistory: [] as (readonly vscode.Selection[])[],
  isMouseSelection: false,
  recordedColumns: [] as number[],
  selectionUpdatedByChords: false,
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
})

let store = initialStore()

type Store = typeof store

const subscribers = new Map<keyof Store, ((store: Readonly<Store>) => void)[]>()

export const set = <K extends keyof Store>(key: K, value: Store[K]) => {
  store[key] = value
  const subs = subscribers.get(key)
  if (!subs) return
  for (const sub of subs) sub(store)
}

export const get = <K extends keyof Store>(key: K) => store[key]

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
  // killCapsLockRemapper()
}

vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('chords')) {
    const context = get('context')

    destroy()
    store = initialStore()

    set('context', context)

    notifyAll()
    // initCapsLockRemapper()

    console.log('[chords] configuration reloaded')
  }
})
