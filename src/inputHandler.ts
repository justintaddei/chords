import vscode from 'vscode'
import { collapseSelections } from './actions/collapseSelections'
import type { Chord } from './chords'
import { config } from './config'
import { record } from './recorder'
import { get, set, subscribe } from './store'
import type { Mode } from './types'
import { setMessage, showWarning } from './ui/statusBar'
import { constructChord, getChord, isValid } from './utils/chords'
import { highlightMatch } from './utils/highlight'
import { disposable } from './utils/vscodeSubscriptionManager'

export type ChordDescriptor = {
  chord: string[]
  mode: Mode
  capture: null | string
  captureCommittedWithShift: boolean
}

const saveLastChord = () => {
  set('lastChord', {
    chord: get('chord'),
    mode: get('mode'),
    capture: get('lastChord').capture,
    captureCommittedWithShift: get('lastChord').captureCommittedWithShift,
  })
}

let clearHighlights: null | (() => void) = null

export const clearCapture = (fulfilled = false) => {
  vscode.commands.executeCommand('setContext', 'chords.capture', false)

  set('capturing', false)
  set('onCapture', [])
  set('chord', [])

  if (clearHighlights) {
    clearHighlights()
    clearHighlights = null
  }

  if (!fulfilled) {
    for (const cb of get('onCapture')) {
      cb('', true)
    }
  }
}

export const applyCapture = (str: string) => {
  set('lastChord', {
    chord: get('lastChord').chord,
    mode: get('lastChord').mode,
    capture: str,
    captureCommittedWithShift: get('captureCommittedWithShift'),
  })

  for (const cb of get('onCapture')) {
    cb(str, false)
  }

  record(true)
  clearCapture(true)
}

export const awaitCapture = (
  cb: (char: string) => void | Promise<void>,
  singleChar = true
) => {
  if (get('replaying') || get('repeatingChord')) {
    const lastCapture = get('lastChord').capture
    if (lastCapture) {
      set(
        'captureCommittedWithShift',
        get('lastChord').captureCommittedWithShift
      )
      return Promise.resolve(cb(lastCapture))
    }
  }

  set('capturing', true)
  set('capturingSingleChar', singleChar)
  set('capturedString', '')

  setMessage('(waiting for input)')

  return new Promise<void>((resolve, reject) => {
    set(
      'onCapture',
      get('onCapture').concat(async (c, canceled) => {
        if (canceled) return reject(canceled)
        await Promise.resolve(cb(c))
        resolve()
      })
    )

    vscode.commands.executeCommand('setContext', 'chords.capture', true)
  })
}

const handleCapture = (char: string) => {
  if (char === '<enter>') {
    if (get('capturedString').length === 0) return clearCapture(true)

    set('captureCommittedWithShift', false)
    return applyCapture(get('capturedString'))
  }
  if (char === '<shift+enter>') {
    if (get('capturedString').length === 0) return clearCapture(true)

    set('captureCommittedWithShift', true)
    return applyCapture(get('capturedString'))
  }

  if (get('capturingSingleChar')) {
    return applyCapture(char === '<space>' ? ' ' : char)
  }

  if (char === '<backspace>') {
    if (get('capturedString').length === 0) return
    set('capturedString', get('capturedString').slice(0, -1))
  } else if (char === '<space>') {
    set('capturedString', get('capturedString') + ' ')
  } else {
    set('capturedString', get('capturedString') + char)
  }

  if (clearHighlights) {
    clearHighlights()
    clearHighlights = null
  }

  clearHighlights = highlightMatch(
    get('capturedString'),
    get('highlightCapture')
  )

  return setMessage(`[${get('capturedString')}]`)
}

export const onInput = async (char: string) => {
  if (get('capturing')) return handleCapture(char)

  if (char === config().get('leader')) {
    set('modeBeforeLeader', get('mode'))
    set('mode', 'leader')
    return
  }

  set('chord', get('chord').concat(char))

  if (!isValid()) {
    console.log(
      `[chords] No valid chord '${constructChord()[1]}' for mode '${get('mode')}'`
    )
    showWarning('(invalid chord)')
    set('chord', [])
    return
  }

  const [count, motion] = constructChord()

  if (motion in get('chords')[get('mode')]) {
    set('chordActive', true)
    for (let i = 0; i < count; i++) {
      // the mode can be updated by commands (e.g. "2i"),
      // so we need to check this on each iteration.
      if (get('mode') === 'insert') {
        set('repeatingChord', false)
        set('chordActive', false)
        return showWarning('(insert cannot be repeated)')
      }

      const command = getChord(motion)

      const execCord = async (c: Chord) => {
        if (Array.isArray(c)) {
          for (const _c of c) await execCord(_c)
          return
        }

        set('chord', [])
        if (get('mode') === 'leader') set('mode', get('modeBeforeLeader'))

        if (typeof c === 'string')
          return await vscode.commands.executeCommand(c)

        await vscode.commands.executeCommand(c.cmd, ...c.args)
      }

      if (command !== 'chords.repeatLastChord') {
        saveLastChord()
        if (command !== 'chords.toggleRecording') record()
      }
      await execCord(command)

      set('repeatingChord', true)
    }
    set('repeatingChord', false)
    set('chordActive', false)
  }
}

subscribe(['mode'], ({ mode }) => {
  set('chord', [])

  if (mode === 'normal') collapseSelections('anchor')
})

disposable(
  vscode.window.onDidChangeTextEditorSelection(({ selections }) => {
    if (get('chordActive')) return

    const hasSelections = selections.some((s) => !s.isEmpty)

    if (get('mode') === 'normal' && hasSelections) return set('mode', 'visual')

    if (get('mode') === 'visual' && !hasSelections) return set('mode', 'normal')
  })
)
