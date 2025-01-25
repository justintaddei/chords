import vscode from 'vscode'

export const updateSelections = (
  cb: (
    selection: vscode.Selection,
    editor: vscode.TextEditor
  ) => vscode.Selection | null
) => {
  if (!vscode.window.activeTextEditor) return false

  const editor = vscode.window.activeTextEditor

  const newSelections: vscode.Selection[] = []

  let atLeastOneModified = false

  for (const selection of editor.selections) {
    const modifiedSelection = cb(selection, editor)

    if (modifiedSelection) atLeastOneModified = true

    newSelections.push(modifiedSelection ?? selection)
  }

  if (!atLeastOneModified) return false

  editor.selections = newSelections
  editor.revealRange(newSelections[0])

  return true
}
