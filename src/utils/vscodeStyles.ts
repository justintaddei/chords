import vscode from 'vscode'
import { debug } from './debug'
import { cursorStyleMap, isValidEnum, lineNumbersMap } from './vscodeEnumMaps'

export const setCursorStyle = (
  value: keyof typeof cursorStyleMap | undefined
) => {
  if (!vscode.window.activeTextEditor) return

  if (!isValidEnum(value, cursorStyleMap)) {
    debug(
      '[chords] Invalid cursor style:',
      value,
      '. Valid values are:',
      Object.keys(cursorStyleMap)
    )
    return
  }

  vscode.window.activeTextEditor.options.cursorStyle = cursorStyleMap[value]
}

export const setLineNumbers = (
  value: keyof typeof lineNumbersMap | undefined
) => {
  if (!vscode.window.activeTextEditor) return

  if (!isValidEnum(value, lineNumbersMap)) {
    debug(
      '[chords] Invalid line numbers style:',
      value,
      '. Valid values are:',
      Object.keys(lineNumbersMap)
    )
    return
  }

  vscode.window.activeTextEditor.options.lineNumbers = lineNumbersMap[value]
}
