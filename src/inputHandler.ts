import vscode from 'vscode'
import { collapseSelections } from './actions/collapseSelections'
import { correctVisualSelections } from './actions/initializeVisualSelections'
import { Chord } from './chords'
import { record } from './recorder'
import { get, set, subscribe } from './store'
import { updateEditorStyles } from './ui/editorStyles'
import { showWarning } from './ui/statusBar'
import { constructChord, getChord, isValid } from './utils/chords'
import { recordCursorColumns } from './utils/recordColumns'
import { disposable } from './utils/vscodeSubscriptionManager'

export const onInput = async (char: string) => {
  if (get('recording')) record(char)

  if (get('mode') === 'insert')
    return vscode.commands.executeCommand('default:type', { text: char })

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

  // A motion can be valid even if it's not complete.
  // We know a motion is both valid and complete when it's in the chords map.
  if (!(motion in get('chords')[get('mode')])) return

  set('processing', true)

  for (let i = 0; i < count; i++) {
    // the mode can be updated by commands (e.g. "2i"),
    // so we need to check this on each iteration.
    if (get('mode') === 'insert') {
      // TODO: do we need to track the users typed text?
    }

    const command = getChord(motion)

    const execCord = async (c: Chord) => {
      if (Array.isArray(c)) {
        for (const _c of c) await execCord(_c)
        return
      }

      set('chord', [])
      // if (get('mode') === 'leader') set('mode', get('modeBeforeLeader'))

      if (typeof c === 'string') return await vscode.commands.executeCommand(c)

      await vscode.commands.executeCommand(c.cmd, ...c.args)
    }

    await execCord(command)
  }

  set('processing', false)
}

subscribe(['mode'], ({ mode, processing }) => {
  set('chord', [])

  if (mode === 'normal') collapseSelections(processing ? 'left' : 'active')
  if (mode === 'visual') correctVisualSelections()
})

disposable(
  vscode.window.onDidChangeTextEditorSelection(({ selections, kind }) => {
    set('isMouseSelection', kind === vscode.TextEditorSelectionChangeKind.Mouse)

    updateEditorStyles(get('mode'))

    if (get('selectionUpdatedByChords')) {
      set('selectionUpdatedByChords', false)
      return
    }

    recordCursorColumns()

    if (kind === vscode.TextEditorSelectionChangeKind.Command) return

    const hasSelections = selections.some((s) => !s.isEmpty)

    if (get('mode') === 'normal' && hasSelections) return set('mode', 'visual')
    if (get('mode') === 'visual' && !hasSelections) return set('mode', 'normal')
  })
)
