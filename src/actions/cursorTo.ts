import vscode from 'vscode'
import { CharPosition } from '../parsing/utils/charPosition'
import { columnToCharacter, moveActiveWrap } from '../selections/selections'
import { updateSelections } from '../selections/updateSelections'
import { safeTranslate } from '../selections/utils/safeTranslate'
import { validatePosition } from '../selections/utils/validation'

export const cursorTo = (
  predicate: (
    doc: vscode.TextDocument,
    offset: number,
    selection: vscode.Selection,
    select: boolean
  ) => CharPosition | null,
  { offset = 0, select = false } = {}
) => {
  updateSelections((selection, editor) => {
    const doc = editor.document

    let match: CharPosition | null = null

    const docOffset = Math.max(0, doc.offsetAt(selection.active) + offset)

    match = predicate(doc, docOffset, selection, select)

    if (!match) return null

    return select ? match.selectFrom(selection) : match.cursor
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
