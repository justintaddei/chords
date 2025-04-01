import vscode from 'vscode'
import { safeTranslate } from './selections'

export const charAt = (
  editor: vscode.TextEditor,
  position: vscode.Position
) => {
  return editor.document.getText(
    new vscode.Range(position, safeTranslate(position, 0, 1, editor))
  )
}
