import vscode from 'vscode'
import { config, editorConfig } from '../config'
import { get, subscribe } from '../store'
import type { Mode } from '../types'
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
    setCursorStyle(config().get('visualMode.cursorStyle'))
    setLineNumbers(config().get('visualMode.lineNumbers'))
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
