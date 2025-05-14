import vscode from 'vscode'

export const validatePosition = (
  position: vscode.Position,
  editor?: vscode.TextEditor
): vscode.Position => {
  const { character } = position

  const document = editor?.document ?? vscode.window.activeTextEditor?.document

  if (!document) return position

  return document.validatePosition(position).with({
    character: Math.max(
      0,
      Math.min(character, document.lineAt(position.line).text.length)
    ),
  })
}

export const createValidPosition = (
  line: number,
  character: number,
  editor?: vscode.TextEditor
): vscode.Position => {
  return validatePosition(
    new vscode.Position(Math.max(0, line), Math.max(0, character)),
    editor
  )
}
