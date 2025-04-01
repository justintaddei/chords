import vscode from 'vscode'
import { get, set } from '../store'

export const restoreSelections = () => {
  if (!vscode.window.activeTextEditor) return
  if (!get('selectionHistory').length) return

  const [selections, ...previousSelections] = get('selectionHistory')

  if (!selections) return

  vscode.window.activeTextEditor.selections = selections

  set('selectionHistory', previousSelections)
}
