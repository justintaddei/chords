import vscode from 'vscode'
import { safeTranslate } from '../utils/selections'
import { updateSelections } from '../utils/updateSelections'

export const collapseSelections = (
  direction: 'start' | 'end' | 'anchor' | 'active' | 'left'
) => {
  updateSelections(
    (selection, editor) => {
      if (selection.isEmpty) return null

      if (direction === 'left') {
        if (selection.isReversed) direction = 'active'
        else direction = 'anchor'
      }

      const collapsePosition = selection.isReversed
        ? selection[direction]
        : safeTranslate(
            selection[direction],
            0,
            selection[direction].character > 0 ? -1 : 0,
            editor
          )

      return new vscode.Selection(collapsePosition, collapsePosition)
    },
    { blockCursorCorrection: false }
  )
}
