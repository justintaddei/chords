import { isBracketPair, isQuotePair } from '../utils/charPairs'

type Descriptions = Record<string, string | ((...args: any[]) => string)>

export const descriptions: Descriptions = {
  'chords.repeatLastChord': 'Repeat the previous chord',
  'chords.toggleRecording': 'Toggle macro recording',
  'chords.replay': 'Replay the last recorded macro',
  'chords.setInsertMode': 'Enter insert mode',
  'chords.setNormalMode': 'Enter normal mode',
  'chords.setVisualMode': 'Enter visual mode',
  'chords.setLeaderMode': 'Enter leader mode',
  cursorRight: 'Move the cursor right',
  cursorLeft: 'Move the cursor left',
  cursorUp: 'Move the cursor up',
  cursorDown: 'Move the cursor down',
  cursorHome: 'Move the cursor to the start of the line',
  cursorEnd: 'Move the cursor to the end of the line',
  cursorTop: 'Move the cursor to the first line of the document',
  cursorBottom: 'Move the cursor to the last line of the document',
  cursorWordStartRight:
    '(VS Code built-in) Move the cursor to the start of the next word',
  cursorWordEndRight:
    '(VS Code built-in) Move the cursor to the end of the next word',
  cursorWordStartLeft:
    '(VS Code built-in) Move the cursor to the start of the previous word',
  cursorWordEndLeft:
    '(VS Code built-in) Move the cursor to the end of the previous word',
  'chords.cursorToWordStartRight':
    'Move the cursor to the start of the next word',
  'chords.cursorToWordEndRight': 'Move the cursor to the end of the next word',
  'chords.cursorToWordStartRightSelect': 'Select to the start of the next word',
  'chords.cursorToWordEndRightSelect': 'Select to the end of the next word',
  'chords.cursorToWordStartLeft':
    'Move the cursor to the start of the previous word',
  'chords.cursorToWordEndLeft':
    'Move the cursor to the end of the previous word',
  'chords.cursorToWordStartLeftSelect':
    'Select to the start of the previous word',
  'chords.cursorToWordEndLeftSelect': 'Select to the end of the previous word',
  'chords.selectAroundWord': 'Select around the word under the cursor',
  'chords.selectInsideWord': 'Select inside the word under the cursor',
  deleteLeft: 'Delete',
  deleteRight: 'Delete right',
  'editor.action.deleteLines': 'Delete the line under the cursor',
  deleteWordRight: 'Delete the word to the right of the cursor',
  'chords.paragraphUp': 'Move the cursor up one paragraph',
  'chords.paragraphDown': 'Move the cursor down one paragraph',
  'editor.action.insertLineAfter': 'Insert a line after the current one',
  'editor.action.insertLineBefore': 'Insert a line before the current one',
  'chords.selectSymbolAtCursor': 'Select the symbol under the cursor',
  'editor.action.jumpToBracket': 'Move the cursor to the matching bracket',
  'chords.cursorToCharRight':
    'Wait for a character to be typed, then search right for it and move the cursor to it',
  'chords.cursorToCharLeft':
    'Wait for a character to be typed, then search left for it and move the cursor to it',
  'chords.cursorToCharRightSelect':
    'Wait for a character to be typed, then search right for it and select to it',
  'chords.cursorToCharLeftSelect':
    'Wait for a character to be typed, then search left for it and select to it',
  'chords.cursorToMatchRight':
    'Wait for a string to be typed, then search right for it and move the cursor to it',
  'chords.cursorToMatchLeft':
    'Wait for a string to be typed, then search left for it and move the cursor to it',
  'chords.cursorToMatchRightSelect':
    'Wait for a string to be typed, then search right for it and select to it',
  'chords.cursorToMatchLeftSelect':
    'Wait for a string to be typed, then search left for it and select to it',
  'editor.action.insertCursorBelow': 'Insert a cursor below the current one',
  'editor.action.insertCursorAbove': 'Insert a cursor above the current one',
  'editor.action.addSelectionToNextFindMatch':
    'Add the next occurrence of the current selection to the selections',
  'editor.action.addSelectionToPreviousFindMatch':
    'Add the previous occurrence of the current selection to the selections',
  'editor.emmet.action.incrementNumberByOne':
    'Increment the number under the cursor by one',
  'editor.emmet.action.decrementNumberByOne':
    'Decrement the number under the cursor by one',
  'chords.replaceCharUnderCursor':
    'Wait for a character to be typed, then replace the character under the cursor with it',
  undo: 'Undo the last action',
  redo: 'Redo the last undone action',
  'chords.saveSelections': 'Save the current selections to the stack',
  'chords.restoreSelections':
    'Pop the last selections from the stack and restore them',
  'chords.restoreCursors': 'Restore the cursors to the last saved position',
  'editor.action.clipboardPasteAction': 'Paste from clipboard',
  'editor.action.clipboardCutAction': 'Cut to clipboard',
  'editor.action.clipboardCopyAction': 'Copy to clipboard',
  cursorLeftSelect: 'Select to the left',
  cursorRightSelect: 'Select to the right',
  cursorUpSelect: 'Select up',
  cursorDownSelect: 'Select down',
  'chords.paragraphUpSelect': 'Select to the paragraph above',
  'chords.paragraphDownSelect': 'Select to the paragraph below',
  cursorEndSelect: 'Select to the end of the line',
  cursorHomeSelect: 'Select to the start of the line',
  cursorWordStartRightSelect:
    '(VS Code built-in) Select to the start of the next word',
  cursorWordEndRightSelect:
    '(VS Code built-in) Select to the end of the next word',
  cursorWordStartLeftSelect:
    '(VS Code built-in) Select to the start of the previous word',
  cursorWordEndLeftSelect:
    '(VS Code built-in) Select to the end of the previous word',
  cursorTopSelect: 'Select to the first line of the document',
  cursorBottomSelect: 'Select to the last line of the document',
  cursorLineStart: 'Move the cursor to the start of the line',
  cursorLineEnd: 'Move the cursor to the end of the line',
  cursorLineStartSelect: 'Select to the start of the line',
  cursorLineEndSelect: 'Select to the end of the line',
  expandLineSelection:
    'Expand the selection to the full line, or selection the line below',
  'chords.highlightSelections': 'Temporarily highlight the active selections',
  'editor.action.smartSelect.expand':
    'Expand selection using VS Code smart select',
  'editor.action.smartSelect.shrink':
    'Shrink selection using VS Code smart select',
  'chords.selectAroundRight': (left, right) => {
    if (isQuotePair(left, right)) {
      if (left === '"') return 'Searching right, select around double quotes'
      if (left === "'") return 'Searching right, select around single quotes'
      if (left === '`') return 'Searching right, select around backticks'
    }
    if (isBracketPair(left, right))
      return `Searching right, select around ${left} and ${right} brackets`

    return `Searching right, select around ${left} and ${right} characters`
  },
  'chords.selectAroundLeft': (left, right) => {
    if (isQuotePair(left, right)) {
      if (left === '"') return 'Searching left, select around double quotes'
      if (left === "'") return 'Searching left, select around single quotes'
      if (left === '`') return 'Searching left, select around backticks'
    }
    if (isBracketPair(left, right))
      return `Searching left, select around ${left} and ${right} brackets`

    return `Searching left, select around ${left} and ${right} characters`
  },
  'chords.selectInsideRight': (left, right) => {
    if (isQuotePair(left, right)) {
      if (left === '"') return 'Searching right, select between double quotes'
      if (left === "'") return 'Searching right, select between single quotes'
      if (left === '`') return 'Searching right, select between backticks'
    }
    if (isBracketPair(left, right))
      return `Searching right, select between ${left} and ${right} brackets`

    return `Searching right, select between ${left} and ${right} characters`
  },
  'chords.selectInsideLeft': (left, right) => {
    if (isQuotePair(left, right)) {
      if (left === '"') return 'Searching left, select between double quotes'
      if (left === "'") return 'Searching left, select between single quotes'
      if (left === '`') return 'Searching left, select between backticks'
    }
    if (isBracketPair(left, right))
      return `Searching left, select between ${left} and ${right} brackets`

    return `Searching left, select between ${left} and ${right} characters`
  },
  'chords.selectInsideXMLTag': 'Select inside the XML tag under the cursor',
  'chords.selectAroundXMLTag': 'Select around the XML tag under the cursor',
  'editor.action.selectToBracket': 'Select around the nearest bracket pair',
  'chords.shrinkSelections': (left, right) => {
    if (typeof left === 'undefined')
      return 'Shrink the selections by one character in each direction'

    if (left === right)
      return `Shrink the selections by ${left} character in each direction`

    return `Shrink the selections by ${left} character on the left and ${right} on the right`
  },
  'editor.action.removeBrackets':
    'Remove the nearest brackets around the cursor',
  'editor.action.showHover': 'Show the hover tooltip',
  'workbench.action.focusLeftGroup': 'Focus the left editor group',
  'workbench.action.focusRightGroup': 'Focus the right editor group',
  'workbench.action.moveEditorToNextGroup':
    'Move the current editor to the next group',
  'workbench.action.moveEditorToPreviousGroup':
    'Move the current editor to the previous group',
  'workbench.action.previousEditor': 'Move the focus to the previous tab',
  'workbench.action.nextEditor': 'Move the focus to the next tab',
  'editor.action.rename': 'Rename the symbol under the cursor',
  'editor.action.transformToUppercase': 'Transform the selection to uppercase',
  'editor.action.transformToLowercase': 'Transform the selection to lowercase',
  'editor.action.transformToKebabcase': 'Transform the selection to kebab-case',
  'editor.action.transformToSnakecase': 'Transform the selection to snake_case',
  'editor.action.transformToCamelcase': 'Transform the selection to camelCase',
  'editor.action.transformToTitlecase': 'Transform the selection to Title Case',
  'editor.action.transformToPascalcase':
    'Transform the selection to PascalCase',
  togglePeekWidgetFocus:
    'Toggle the focus between the editor and the peek widget',
  'editor.action.revealDefinition':
    'Reveal the definition of the symbol under the cursor',
  'workbench.action.gotoSymbol': 'Open document symbol search',
  'workbench.action.gotoLine': 'Open line number search',
  'editor.action.goToReferences':
    'Open references for the symbol under the cursor',
  'editor.emmet.action.evaluateMathExpression':
    'Evaluate the math expression under the cursor',
  'editor.action.peekDefinition':
    'Peek at the definition of the symbol under the cursor',
  'editor.action.marker.next': 'Go to next problem',
  'editor.action.marker.prev': 'Go to previous problem',
}
