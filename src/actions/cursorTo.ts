import vscode from 'vscode'
import { CharPosition } from '../parsing/utils/charPosition'
import { columnToCharacter, moveActiveWrap } from '../selections/selections'
import { updateSelections } from '../selections/updateSelections'
import { safeTranslate } from '../selections/utils/safeTranslate'
import { validatePosition } from '../selections/utils/validation'
import { get } from '../store'

export const cursorTo = (
  predicate: (options: {
    doc: vscode.TextDocument
    offset: number
    selection: vscode.Selection
    startUnderCursor?: boolean
  }) => CharPosition | [CharPosition, CharPosition] | null,
  { select = false } = {}
) => {
  updateSelections((selection, editor) => {
    const doc = editor.document

    let match: CharPosition | [CharPosition, CharPosition] | null = null

    const docOffset = Math.max(0, doc.offsetAt(selection.active))

    match = predicate({ doc, offset: docOffset, selection })

    if (!match) return null

    if (Array.isArray(match)) {
      const [start, end] = match

      if (get('debugJump')) {
        start.highlight()
        end.highlight()
        return null
      }

      return end.selectFrom(start)
    }

    if (get('debugJump')) {
      match.highlight()
      return null
    }

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
