import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { charAt } from './charAt.js'

suite('charAt', () => {
  let editor: vscode.TextEditor

  setup(async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'abc\ndef',
    })
    editor = await vscode.window.showTextDocument(document)
  })

  test('should return the character at the specified position', () => {
    const position = new vscode.Position(1, 1)
    const result = charAt(editor, position)

    assert.strictEqual(result, 'e')
  })

  test('should handle empty text gracefully', async () => {
    const emptyDocument = await vscode.workspace.openTextDocument({
      content: '',
    })
    editor = await vscode.window.showTextDocument(emptyDocument)

    const position = new vscode.Position(0, 0)
    const result = charAt(editor, position)

    assert.strictEqual(result, '')
  })
})
