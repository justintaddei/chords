import vscode from 'vscode'
import { get, set } from '../store'
import { debug } from './debug'
import { recordCursorColumns } from './recordColumns'
import {
  characterToColumn,
  createValidPosition,
  isInvertedSingleChar,
  moveActive,
  moveAnchor,
  reverse,
} from './selections'

const incrementColumn = (columnRecordIndex: number) => {
  debug(
    `incrementing cursor column (${get('recordedColumns')[columnRecordIndex]} -> ${get('recordedColumns')[columnRecordIndex] + 1})`
  )
  get('recordedColumns')[columnRecordIndex] += 1
}

const decrementColumn = (columnRecordIndex: number) => {
  debug(
    `decrementing cursor column (${get('recordedColumns')[columnRecordIndex]} -> ${get('recordedColumns')[columnRecordIndex] - 1})`
  )
  get('recordedColumns')[columnRecordIndex] -= 1
}

const applyBlockCursorCorrection = (
  prev: vscode.Selection,
  curr: vscode.Selection,
  editor: vscode.TextEditor,
  { discrete = false, columnRecordIndex = -1 } = {}
): vscode.Selection => {
  if (prev.isEmpty && curr.isEmpty) {
    debug(
      'Applying block cursor correction to updated cursor positions (prev -> updated -> corrected)'
    )

    const lineLength = editor.document.lineAt(curr.active.line).text.length
    if (lineLength === 0) return curr
    if (curr.active.character < lineLength) return curr

    let correctedPosition: vscode.Position

    if (
      prev.active.line !== curr.active.line ||
      curr.active.line === editor.document.lineCount - 1
    ) {
      debug('N/A -> abcdefg| -> abcdef|g (prevented cursor on eol)')
      correctedPosition = createValidPosition(
        curr.active.line,
        lineLength - 1,
        editor
      )
    } else {
      debug(
        'abcdef|g -> abcdefg| -> [\\n]abcdef|g (cursor moved forward to eol, repositioned it to the start of next line)'
      )
      correctedPosition = createValidPosition(curr.active.line + 1, 0, editor)
    }

    return new vscode.Selection(correctedPosition, correctedPosition)
  }

  debug(
    'Applying block cursor correction to updated selections (prev -> updated -> corrected)'
  )

  if (!prev.isReversed && curr.isReversed && discrete) {
    debug(
      'abcd|ef]g -> abc[d|efg -> ab[cde|fg (correct vertical movement that reverses the selection)'
    )
    if (columnRecordIndex !== -1) decrementColumn(columnRecordIndex)

    return moveActive(moveAnchor(curr, 1, editor), -1, editor)
  }

  if (isInvertedSingleChar(curr)) {
    debug(
      'n/a -> abc|d]efg -> abc[d|efg (fixed inverted single char selection)'
    )
    return reverse(curr)
  }

  if (prev.isReversed && (!curr.isReversed || curr.isEmpty)) {
    if (curr.isEmpty)
      debug(
        'abc[d|efg -> abcd|efg -> abc|de]fg (anchor moves one char to the left, active moves one char to the right)'
      )
    else
      debug(
        'abc[d|efg -> abcd|e]fg -> abc|def]g (anchor moves one char to the left, active moves one char to the right)'
      )

    if (discrete && !curr.isEmpty && columnRecordIndex !== -1)
      incrementColumn(columnRecordIndex)

    const lineLength = editor.document.lineAt(curr.active.line).text.length

    if (curr.active.character + 1 > lineLength) {
      const startOfNextLine = createValidPosition(
        curr.active.line + 1,
        0,
        editor
      )
      return moveAnchor(
        new vscode.Selection(curr.active, startOfNextLine),
        -1,
        editor
      )
    }

    return moveAnchor(moveActive(curr, 1, editor), -1, editor)
  }

  if ((!prev.isReversed || prev.isEmpty) && curr.isReversed) {
    if (prev.isEmpty)
      debug(
        'abc|defg -> a[bc|defg -> a[bcd|efg (anchor moves one char to the right)'
      )
    else
      debug(
        'abc|def]g -> a[bc|defg -> a[bcd|efg (anchor moves one char to the right)'
      )
    return moveAnchor(curr, 1, editor)
  }

  if (!curr.isReversed && !discrete) {
    debug('N/A -> ab|cd]efg -> ab|cde]fg (active moves one char to the right)')

    return moveActive(curr, 1, editor)
  }

  return curr
}

export const updateSelections = (
  cb: (
    selection: vscode.Selection,
    editor: vscode.TextEditor,
    lastRecordedColumn: number
  ) => vscode.Selection | null,
  {
    revealRange = true,
    blockCursorCorrection = true,
    discrete = false,
    skipColumnRecording = false,
  } = {}
) => {
  if (!vscode.window.activeTextEditor) return false

  const editor = vscode.window.activeTextEditor

  const newSelections: vscode.Selection[] = []

  let atLeastOneModified = false

  for (const selection of editor.selections) {
    const lastRecordedColumn =
      get('recordedColumns')[editor.selections.indexOf(selection)] ??
      characterToColumn(selection, editor)

    let modifiedSelection = cb(selection, editor, lastRecordedColumn)

    if (modifiedSelection && !modifiedSelection.isEqual(selection)) {
      atLeastOneModified = true

      if (blockCursorCorrection) {
        modifiedSelection = applyBlockCursorCorrection(
          selection,
          modifiedSelection,
          editor,
          { discrete, columnRecordIndex: editor.selections.indexOf(selection) }
        )
      }
    }

    newSelections.push(modifiedSelection ?? selection)
  }

  if (!atLeastOneModified) return false

  set('selectionUpdatedByChords', true)

  editor.selections = newSelections

  if (!skipColumnRecording) recordCursorColumns()

  if (revealRange) editor.revealRange(newSelections[0])

  return true
}
