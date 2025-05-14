import vscode from 'vscode'
import { config, editorConfig } from '../config'
import { length } from '../selections/selections'
import { Mode, get, subscribe } from '../store'
import { setCursorStyle, setLineNumbers } from '../utils/vscodeStyles'
import { disposable } from '../utils/vscodeSubscriptionManager'

export const updateEditorStyles = (mode: Mode) => {
  if (mode === 'insert') {
    setCursorStyle(editorConfig().get('cursorStyle'))
    setLineNumbers(editorConfig().get('lineNumbers'))
  }

  if (mode === 'normal') {
    setCursorStyle(config().get('normalMode.cursorStyle'))
    setLineNumbers(config().get('normalMode.lineNumbers'))
  }

  if (mode === 'visual') {
    setLineNumbers(config().get('visualMode.lineNumbers'))

    const selections = vscode.window.activeTextEditor?.selections

    if (selections?.some((s) => length(s) > 1 || !s.isReversed)) {
      setCursorStyle(config().get('visualMode.cursorStyleSelection'))
    } else {
      setCursorStyle(config().get('visualMode.cursorStyleEmpty'))
    }
  }
}

subscribe(['mode'], ({ mode }) => {
  vscode.commands.executeCommand('setContext', 'chords.mode', mode)
  updateEditorStyles(mode)
})

disposable(
  vscode.window.onDidChangeActiveTextEditor((e) => {
    updateEditorStyles(get('mode'))
  })
)
