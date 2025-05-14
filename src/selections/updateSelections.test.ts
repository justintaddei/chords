import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { get, set } from '../store'
import * as recordColumnsModule from '../utils/recordColumns' // Import the module to spy on
import { updateSelections } from './updateSelections'

suite('updateSelections', () => {
  let mockEditor: vscode.TextEditor
  let mockDocument: vscode.TextDocument

  setup(async () => {
    const documentContent = 'line 1\nline 2\nline 3'
    mockDocument = await vscode.workspace.openTextDocument({
      content: documentContent,
    })
    mockEditor = await vscode.window.showTextDocument(mockDocument)

    // Initialize the store
    set('recordedColumns', [0, 0, 0])
    set('selectionUpdatedByChords', false)
  })

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
  })

  test('should modify selections based on callback', () => {
    mockEditor.selections = [
      new vscode.Selection(0, 0, 0, 4), // "line"
    ]

    const callback = (selection: vscode.Selection) =>
      new vscode.Selection(selection.start.line, 0, selection.start.line, 2) // "li"

    const result = updateSelections(callback, { blockCursorCorrection: false })

    assert.strictEqual(result, true)
    assert.strictEqual(mockEditor.selections[0].end.character, 2)
  })

  test('should skip column recording when option is set', () => {
    mockEditor.selections = [
      new vscode.Selection(0, 0, 0, 4), // "line"
    ]

    const callback = (selection: vscode.Selection) =>
      new vscode.Selection(selection.start.line, 0, selection.start.line, 2) // "li"

    let recordCalled = false

    // Mock the recordCursorColumns function
    const mockRecordCursorColumns = () => {
      recordCalled = true
    }

    // Use dependency injection to replace the function
    const originalRecordCursorColumns = recordColumnsModule.recordCursorColumns
    Object.defineProperty(recordColumnsModule, 'recordCursorColumns', {
      value: mockRecordCursorColumns,
      configurable: true,
    })

    updateSelections(callback, { skipColumnRecording: true })

    assert.strictEqual(recordCalled, false)

    // Restore the original function
    Object.defineProperty(recordColumnsModule, 'recordCursorColumns', {
      value: originalRecordCursorColumns,
      configurable: true,
    })
  })

  test('should not modify selections when callback returns null', () => {
    mockEditor.selections = [
      new vscode.Selection(0, 0, 0, 4), // "line"
    ]

    const callback = () => null

    const result = updateSelections(callback)

    assert.strictEqual(result, false)
    assert.strictEqual(mockEditor.selections[0].end.character, 4)
  })

  test('should reveal range when revealRange is enabled', () => {
    mockEditor.selections = [
      new vscode.Selection(0, 0, 0, 4), // "line"
    ]

    const callback = (selection: vscode.Selection) =>
      new vscode.Selection(selection.start.line, 0, selection.start.line, 2) // "li"

    let revealCalled = false
    const originalRevealRange = mockEditor.revealRange
    mockEditor.revealRange = () => {
      revealCalled = true
    }

    updateSelections(callback, { revealRange: true })

    assert.strictEqual(revealCalled, true)

    // Restore original function
    mockEditor.revealRange = originalRevealRange
  })

  test('should handle multiple selections across lines', () => {
    mockEditor.selections = [
      new vscode.Selection(0, 0, 0, 4), // "line"
      new vscode.Selection(1, 0, 1, 4), // "line"
    ]

    const callback = (selection: vscode.Selection) =>
      new vscode.Selection(selection.start.line, 0, selection.start.line, 2) // "li"

    const result = updateSelections(callback)

    assert.strictEqual(result, true)
    assert.strictEqual(mockEditor.selections.length, 2)
    assert.strictEqual(mockEditor.selections[0].end.character, 2)
    assert.strictEqual(mockEditor.selections[1].end.character, 2)
  })
})
