import vscode from 'vscode'
import { type ChordMap, defaultChords } from './chords'
import { config } from './config'
import type { ChordDescriptor } from './inputHandler'
import type { Mode } from './types'
import {
  initCapsLockRemapper,
  killCapsLockRemapper,
} from './utils/capsLockRemapper'

const initialStore = () => ({
  context: null as vscode.ExtensionContext | null,
  mode: config().get('defaultMode', 'insert') as Mode,
  modeBeforeLeader: config().get('defaultMode', 'insert') as Mode,
  chordActive: false,
  chord: [] as string[],
  capturing: false,
  capturingSingleChar: false,
  highlightCapture: 'right' as 'right' | 'left',
  capturedString: '',
  onCapture: [] as ((str: string, canceled: boolean) => Promise<void>)[],
  repeatingChord: false,
  captureCommittedWithShift: false,
  selectionHistory: [] as (readonly vscode.Selection[])[],
  recording: false,
  replaying: false,
  recordedChords: [] as ChordDescriptor[],
  lastChord: {
    chord: [],
    mode: config().get('defaultMode', 'insert'),
    capture: null,
    captureCommittedWithShift: false,
  } as ChordDescriptor,
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
  killCapsLockRemapper: null as (() => boolean) | null,
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
  killCapsLockRemapper()
}

vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('chords')) {
    const context = get('context')

    destroy()
    store = initialStore()

    set('context', context)

    notifyAll()
    initCapsLockRemapper()

    console.log('[chords] configuration reloaded')
  }
})
