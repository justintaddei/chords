import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { createValidPosition } from './selections'

suite('selections', () => {
  let mockEditor: vscode.TextEditor
  let mockDocument: vscode.TextDocument

  setup(async () => {
    const documentContent = 'example line\nshort\nanother line'
    mockDocument = await vscode.workspace.openTextDocument({
      content: documentContent,
    })
    mockEditor = await vscode.window.showTextDocument(mockDocument)
  })

  teardown(async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
  })

  suite('createValidPosition', () => {
    test('should return a valid position within bounds', () => {
      const result = createValidPosition(0, 5, mockEditor)
      assert.strictEqual(result.line, 0)
      assert.strictEqual(result.character, 5)
    })

    test('should clamp character to the line length', () => {
      const result = createValidPosition(0, 15, mockEditor)
      assert.strictEqual(result.line, 0)
      assert.strictEqual(result.character, mockDocument.lineAt(0).text.length)
    })

    test('should clamp line to 0 if negative', () => {
      const result = createValidPosition(-5, 5, mockEditor)
      assert.strictEqual(result.line, 0)
      assert.strictEqual(result.character, 5)
    })

    test('should clamp character to 0 if negative', () => {
      const result = createValidPosition(0, -5, mockEditor)
      assert.strictEqual(result.line, 0)
      assert.strictEqual(result.character, 0)
    })
  })
})
