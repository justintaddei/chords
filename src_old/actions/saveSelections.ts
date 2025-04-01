import vscode from 'vscode'
import { get, set } from '../store'

export const saveSelections = () => {
  if (!vscode.window.activeTextEditor) return

  const selectionHistory = get('selectionHistory')

  selectionHistory.push(vscode.window.activeTextEditor.selections)

  set('selectionHistory', selectionHistory)
}
