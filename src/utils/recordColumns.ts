import vscode from 'vscode'
import { characterToColumn } from '../selections/selections'
import { set } from '../store'

export const recordCursorColumns = () => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  set(
    'recordedColumns',
    editor.selections.map((s) => characterToColumn(s, editor))
  )
}
