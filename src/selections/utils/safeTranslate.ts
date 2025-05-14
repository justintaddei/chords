import vscode from 'vscode'
import { createValidPosition } from './validation'

export const safeTranslate = (
  position: vscode.Position,
  lineDelta: number,
  characterDelta: number,
  editor?: vscode.TextEditor
) => {
  return createValidPosition(
    Math.max(0, position.line + lineDelta),
    Math.max(0, position.character + characterDelta),
    editor
  )
}
