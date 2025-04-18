import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { cursorStyleMap, lineNumbersMap } from './vscodeEnumMaps'
import { setCursorStyle, setLineNumbers } from './vscodeStyles'

suite('vscodeStyles - setLineNumbers', () => {
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

  test('should set the correct line number style for a valid value', () => {
    setLineNumbers('relative')
    assert.strictEqual(mockEditor.options.lineNumbers, lineNumbersMap.relative)
  })

  test('should not modify options for an invalid value', () => {
    const invalidValue = 'invalidStyle' as keyof typeof lineNumbersMap
    setLineNumbers(invalidValue)
    assert.strictEqual(mockEditor.options.lineNumbers, lineNumbersMap.on)
  })

  test('should do nothing if there is no active text editor', async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
    setLineNumbers(
      Object.keys(lineNumbersMap)[0] as keyof typeof lineNumbersMap
    )
    // No assertion needed; just ensure no exceptions are thrown
  })
})

suite('vscodeStyles - setCursorStyle', () => {
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

  test('should set the correct cursor style for a valid value', () => {
    setCursorStyle('block')
    assert.strictEqual(mockEditor.options.cursorStyle, cursorStyleMap.block)
  })

  test('should not modify options for an invalid cursor style value', () => {
    const invalidValue = 'invalidCursorStyle' as keyof typeof cursorStyleMap
    setCursorStyle(invalidValue)
    assert.strictEqual(mockEditor.options.cursorStyle, cursorStyleMap.line)
  })

  test('should do nothing if there is no active text editor for cursor style', async () => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
    setCursorStyle(
      Object.keys(cursorStyleMap)[0] as keyof typeof cursorStyleMap
    )
    // No assertion needed; just ensure no exceptions are thrown
  })
})
