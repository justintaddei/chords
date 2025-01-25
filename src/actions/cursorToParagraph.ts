import vscode from 'vscode'
import { updateSelections } from '../utils/updateSelections'

const offset = {
  up: -1,
  down: 1,
}

export const cursorToParagraph = (direction: 'up' | 'down', select = false) => {
  updateSelections((selection, editor) => {
    let line = selection.active.line + offset[direction]

    if (line < 0 || line > editor.document.lineCount) return null

    while (line > 0 && line < editor.document.lineCount) {
      if (editor.document.lineAt(line).isEmptyOrWhitespace) break
      line += offset[direction]
    }

    const nextParagraph = selection.active.with(line)

    return select
      ? new vscode.Selection(selection.anchor, nextParagraph)
      : new vscode.Selection(nextParagraph, nextParagraph)
  })
}
