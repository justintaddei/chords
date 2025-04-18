import vscode from 'vscode'
import { safeTranslate } from './selections'

/**
 * Retrieves the character at a specified position in a text editor.
 *
 * @param editor - The `vscode.TextEditor` instance representing the active text editor.
 * @param position - The `vscode.Position` object specifying the position of the character to retrieve.
 * @returns The character at the specified position as a string.
 */
export const charAt = (
  editor: vscode.TextEditor,
  position: vscode.Position
) => {
  return editor.document.getText(
    new vscode.Range(position, safeTranslate(position, 0, 1, editor))
  )
}
