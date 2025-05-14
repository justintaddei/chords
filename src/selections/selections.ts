import vscode from 'vscode'
import { editorConfig } from '../config'
import { createValidPosition } from '../selections/utils/validation'

export const moveAnchor = (
  selection: vscode.Selection,
  distance: number,
  editor: vscode.TextEditor
): vscode.Selection => {
  const { anchor, active } = selection

  return new vscode.Selection(
    createValidPosition(anchor.line, anchor.character + distance, editor),
    active
  )
}

export const moveActive = (
  selection: vscode.Selection,
  distance: number,
  editor: vscode.TextEditor
): vscode.Selection => {
  const { anchor, active } = selection

  return new vscode.Selection(
    anchor,
    createValidPosition(
      active.line,
      Math.max(0, active.character + distance),
      editor
    )
  )
}

export const moveActiveWrap = (
  selection: vscode.Selection,
  distance: number,
  { document }: vscode.TextEditor
): vscode.Selection => {
  const { anchor, active } = selection

  const offset = document.offsetAt(active)

  const nudge =
    distance > 0 &&
    // !selection.isReversed &&
    active.character === document.lineAt(active.line).text.length
      ? 1
      : 0

  return new vscode.Selection(
    anchor,
    document.positionAt(Math.max(0, offset + distance + nudge))
  )
}

export const reverse = (selection: vscode.Selection): vscode.Selection =>
  new vscode.Selection(selection.active, selection.anchor)

export const length = (selection: vscode.Selection): number => {
  if (selection.anchor.line !== selection.active.line) return Infinity

  return selection.end.character - selection.start.character
}

export const isSingleChar = (selection: vscode.Selection): boolean =>
  length(selection) === 1 && selection.isReversed

export const isInvertedSingleChar = (selection: vscode.Selection): boolean =>
  length(selection) === 1 && !selection.isReversed

export const characterToColumn = (
  selection: vscode.Selection,
  editor: vscode.TextEditor
): number => {
  const line = editor.document.lineAt(selection.active.line)
  const lineText = line.text.slice(0, selection.active.character)
  const expandedTab = new Array(editorConfig().get('tabSize'))
    .fill(' ')
    .join('')

  return lineText.replaceAll('\t', expandedTab).length
}

export const columnToCharacter = (
  selection: vscode.Selection,
  visualCharacter: number,
  editor: vscode.TextEditor
): number => {
  const line = editor.document.lineAt(selection.active.line)
  const lineText = line.text.slice(0, visualCharacter)
  const tabCount = lineText.split('\t').length - 1
  const tabSize = editorConfig().get('tabSize') as number

  return Math.max(
    0,
    Math.min(visualCharacter - tabCount * tabSize + tabCount, line.text.length)
  )
}
