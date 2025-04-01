import * as vscode from 'vscode'

export const lineNumbersMap = {
  off: vscode.TextEditorLineNumbersStyle.Off,
  on: vscode.TextEditorLineNumbersStyle.On,
  relative: vscode.TextEditorLineNumbersStyle.Relative,
  interval: vscode.TextEditorLineNumbersStyle.Interval,
}

export const cursorStyleMap = {
  line: vscode.TextEditorCursorStyle.Line,
  block: vscode.TextEditorCursorStyle.Block,
  underline: vscode.TextEditorCursorStyle.Underline,
  'line-thin': vscode.TextEditorCursorStyle.LineThin,
  'underline-thin': vscode.TextEditorCursorStyle.UnderlineThin,
  'block-outline': vscode.TextEditorCursorStyle.BlockOutline,
}

export const isValidEnum = <T extends object>(
  key: string | undefined,
  obj: T
  // @ts-ignore
): key is keyof T => {
  if (!key) return false
  return key in obj
}
