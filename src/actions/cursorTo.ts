import vscode from 'vscode'
import { CharPosition } from '../parsing/utils/charPosition'
import { columnToCharacter, moveActive } from '../selections/selections'
import { updateSelections } from '../selections/updateSelections'
import { safeTranslate } from '../selections/utils/safeTranslate'
import { validatePosition } from '../selections/utils/validation'
import { get } from '../store'

export const moveTo = (
  predicate: (options: {
    doc: vscode.TextDocument
    offset: number
    selection: vscode.Selection
    startUnderCursor?: boolean
  }) => CharPosition | [CharPosition, CharPosition] | null,
  { select = get('cmd').select } = {}
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
      }

      return end.selectFrom(start)
    }

    if (get('debugJump')) {
      match.highlight()
    }

    return select ? match.selectFrom(selection) : match.cursor
  })
}

export const moveCols = (
  chars: number,
  { select = get('cmd').select } = {}
) => {
  updateSelections(
    (selection, editor) => {
      const updatedActive = moveActive(selection, chars, editor)
      if (select) return updatedActive

      return new vscode.Selection(updatedActive.active, updatedActive.active)
    },
    { naive: true }
  )
}

export const moveRows = (lines: number, { select = get('cmd').select } = {}) => {
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

export const moveAbsCol = (
  col: number,
  { select = get('cmd').select } = {}
) => {
  updateSelections((selection, editor) => {
    const updatedActive = validatePosition(
      selection.active.with({ character: col }),
      editor
    )

    return new vscode.Selection(
      select ? selection.anchor : updatedActive,
      updatedActive
    )
  }, { naive: true })
}