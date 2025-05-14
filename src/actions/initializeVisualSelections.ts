import vscode from 'vscode'
import { updateSelections } from '../selections/updateSelections'
import { safeTranslate } from '../selections/utils/safeTranslate'
import { get } from '../store'

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
