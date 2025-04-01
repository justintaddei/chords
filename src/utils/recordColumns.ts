import vscode from 'vscode'
import { set } from '../store'
import { debug } from './debug'
import { characterToColumn } from './selections'

export const recordCursorColumns = () => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  set(
    'recordedColumns',
    editor.selections.map((s) => characterToColumn(s, editor))
  )
}
