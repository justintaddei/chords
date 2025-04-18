import vscode from 'vscode'
import {
  columnToCharacter,
  moveActiveWrap,
  safeTranslate,
  validatePosition,
} from '../utils/selections'
import { updateSelections } from '../utils/updateSelections'

export const cursorTo = (
  predicate: (
    doc: vscode.TextDocument,
    offset: number,
    selection: vscode.Selection
  ) => vscode.Position | null,
  { offset = 0, select = false } = {}
) => {
  updateSelections((selection, editor) => {
    const doc = editor.document

    let match: vscode.Position | null = null

    const docOffset = Math.max(0, doc.offsetAt(selection.active) + offset)

    match = predicate(doc, docOffset, selection)

    if (!match) return null

    return new vscode.Selection(select ? selection.anchor : match, match)
  })
}

export const moveCursorCharacterwise = (
  chars: number,
  { select = false } = {}
) => {
  updateSelections(
    (selection, editor) => {
      const updatedActive = moveActiveWrap(selection, chars, editor)
      if (select) return updatedActive

      return new vscode.Selection(updatedActive.active, updatedActive.active)
    },
    { naive: true }
  )
}

export const moveCursorLinewise = (lines: number, { select = false } = {}) => {
  updateSelections(
    (selection, editor, lastRecordedColumn) => {
      const updatedActive = validatePosition(
        safeTranslate(selection.active, lines, 0, editor),
        editor
      )

      const updatedSelection = new vscode.Selection(
        select ? selection.anchor : updatedActive,
        updatedActive
      )

      const correctedActive = updatedActive.with({
        character: columnToCharacter(
          updatedSelection,
          lastRecordedColumn,
          editor
        ),
      })

      return new vscode.Selection(
        select ? selection.anchor : correctedActive,
        correctedActive
      )
    },
    { naive: true, skipColumnRecording: true }
  )
}
