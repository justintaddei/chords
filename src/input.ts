import vscode from 'vscode'
import { collapseSelections } from './actions/collapseSelections'
import { correctVisualSelections } from './actions/initializeVisualSelections'
import './chord'
import { executeCmd, parseCmd } from './chord'
import { get, notify, reset, set, subscribe } from './store'
import { updateEditorStyles } from './ui/editorStyles'
import { showWarning } from './ui/statusBar'
import { recordCursorColumns } from './utils/recordColumns'
import { disposable } from './utils/vscodeSubscriptionManager'

subscribe(['mode'], ({ mode, processing }) => {
  reset('cmdStr')

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

export const onInput = async (char: string) => {
  if (get('mode') === 'insert')
    return await vscode.commands.executeCommand('default:type', { text: char })

  get('cmdStr').push(char)
  notify('cmdStr')
}

subscribe(['cmdStr'], async ({ cmdStr }) => {
  if (!cmdStr.length) return reset('cmd')

  const parsedCmd = parseCmd()

  if (!parsedCmd) {
    showWarning('(invalid)')
    return reset('cmdStr')
  }

  if (!parsedCmd.exec) return

  await executeCmd(parsedCmd.cmd)
  reset('cmdStr')
})