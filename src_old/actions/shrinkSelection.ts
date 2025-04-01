import vscode from 'vscode'
import { updateSelections } from '../utils/updateSelections'
import { collapseSelections } from './collapseSelections'

export const shrinkSelections = (insetStart = 1, insetEnd = 1) => {
  updateSelections((selection, editor) => {
    const start = editor.document.offsetAt(selection.start)
    const end = editor.document.offsetAt(selection.end)

    if (start === end) return null

    if (start + insetStart > end - insetEnd)
      return new vscode.Selection(selection.anchor, selection.anchor)

    return new vscode.Selection(
      editor.document.positionAt(start + insetStart),
      editor.document.positionAt(end - insetEnd)
    )
  })
}
