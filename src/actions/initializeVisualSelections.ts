import vscode from 'vscode'
import { get } from '../store'
import { safeTranslate } from '../utils/selections'
import { updateSelections } from '../utils/updateSelections'

export const correctVisualSelections = () => {
  updateSelections(
    (selection, editor) => {
      if (get('isMouseSelection')) return null
      if (get('mode') !== 'visual') return null
      if (!selection.isEmpty) return null

      return new vscode.Selection(
        safeTranslate(selection.anchor, 0, 1, editor),
        selection.active
      )
    },
    { blockCursorCorrection: false }
  )
}
